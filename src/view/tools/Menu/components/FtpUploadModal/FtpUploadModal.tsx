import React, { FC, MouseEvent, useState } from 'react';
import { remote, OpenDialogReturnValue } from 'electron';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import List from 'antd/lib/list';
import message from 'antd/lib/message';
import withModeButton from '@src/components/enhance';
import { Prop } from './componentType';
// import { fetcher } from '@src/service/rpc';
import './FtpUploadModal.less';

const ModeButton = withModeButton()(Button);


/**
 * FTP上传窗口
 * @param props 
 */
const FtpUploadModal: FC<Prop> = (props) => {

    const [fileList, setFileList] = useState<string[]>([]);
    const [defaultCasePath, setDefaultCasePath] = useState<string>(remote.app.getAppPath());

    // useEffect(() => {
    //     fetcher.invoke<string>('GetDataSavePath').then(casePath => {
    //         setDefaultCasePath(casePath);
    //     });
    // }, []);

    const selectBcpHandle = debounce((event: MouseEvent<HTMLInputElement>) => {
        remote.dialog.showOpenDialog({
            defaultPath: defaultCasePath,
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'BCP文件', extensions: ['zip'] },
                { name: '所有文件', extensions: ['*'] }
            ]
        }).then((val: OpenDialogReturnValue) => {
            if (val.filePaths && val.filePaths.length > 0) {
                setFileList(val.filePaths);
            }
        });
    }, 600, { leading: true, trailing: false });

    const renderButtons = () => {
        return <div className="fn-buttons">
            <div>
                <ModeButton
                    onClick={selectBcpHandle}
                    type="primary"
                    icon="select">选择BCP文件</ModeButton>
            </div>
            <div>
                <ModeButton
                    onClick={() => setFileList([])}
                    type="default"
                    icon="rest">清空上传列表</ModeButton>
            </div>
        </div>
    }

    const renderFileList = () => {
        return <div className="file-list-scroll">
            <List
                dataSource={fileList}
                renderItem={item => {
                    let pos = item.lastIndexOf('\\');
                    return <List.Item><span className="bcp-item">{item.substring(pos + 1)}</span></List.Item>
                }}
                size="small"
                bordered={false}
                locale={{ emptyText: <Empty description="无BCP文件" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }} />
        </div>
    }

    return <Modal
        visible={props.visible}
        footer={[
            <ModeButton
                icon={'close-circle'}
                disabled={props.loading}
                type="default"
                onClick={() => {
                    setFileList([]);
                    props.cancelHandle!();
                }}>
                取消
            </ModeButton>,
            <ModeButton
                icon={props.loading ? 'loading' : 'upload'}
                disabled={props.loading}
                type="primary"
                onClick={() => {
                    if (fileList.length === 0) {
                        message.destroy();
                        message.info('请选择BCP文件');
                    } else {
                        props.uploadHandle!(fileList);
                        setFileList([]);
                    }
                }}>
                上传
            </ModeButton>
        ]}
        title="BCP上传"
        width={600}
        maskClosable={false}>
        <div className="ftp-upload-modal-root">
            {renderButtons()}
            {renderFileList()}
        </div>
    </Modal>;

};

FtpUploadModal.defaultProps = {
    visible: false,
    loading: false,
    uploadHandle: () => { },
    cancelHandle: () => { }
}

export default FtpUploadModal;
