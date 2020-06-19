import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { remote, OpenDialogReturnValue } from 'electron';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import List from 'antd/lib/list';
import message from 'antd/lib/message';
import { StoreComponent } from '@src/type/model';
import { FtpModalStoreState } from '@src/model/tools/Menu/FtpUploadModal';
import './FtpUploadModal.less';
import { helper } from '@src/utils/helper';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 上传回调
     */
    uploadHandle?: (arg0: string[]) => void;
    /**
     * 取消
     */
    cancelHandle?: () => void;
};

/**
 * FTP上传窗口
 * @param props 
 */
const FtpUploadModal: FC<Prop> = (props) => {

    const [fileList, setFileList] = useState<string[]>([]);

    const selectBcpHandle = (event: MouseEvent<HTMLInputElement>) => {
        remote.dialog.showOpenDialog({
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
    }

    const renderButtons = () => {
        return <div className="fn-buttons">
            <div>
                <Button
                    onClick={selectBcpHandle}
                    type="primary"
                    icon="select">选择BCP文件</Button>
            </div>
            <div>
                <Button
                    onClick={() => setFileList([])}
                    type="default"
                    icon="rest">清空上传列表</Button>
            </div>
        </div>
    }
    const renderFileList = () => {
        return <div className="file-list-scroll">
            <List
                dataSource={fileList}
                renderItem={item => <List.Item><span className="bcp-item">{item}</span></List.Item>}
                size="small"
                bordered={false}
                locale={{ emptyText: <Empty description="无BCP文件" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }} />
        </div>
    }

    return <Modal
        visible={props.visible}
        onOk={() => {
            if (fileList.length === 0) {
                message.destroy();
                message.info('请选择BCP文件');
            } else {
                props.uploadHandle!(fileList);
            }
        }}
        onCancel={() => {
            setFileList([]);
            props.cancelHandle!();
        }}
        title="BCP上传"
        width={600}
        okButtonProps={{
            icon: 'upload'
        }}
        okText="上传"
        cancelButtonProps={{ icon: 'close-circle' }}
        cancelText="取消">
        <div className="ftp-upload-modal-root">
            {renderButtons()}
            {renderFileList()}
        </div>
    </Modal>;

};

FtpUploadModal.defaultProps = {
    visible: false,
    uploadHandle: () => { },
    cancelHandle: () => { }
}

export default FtpUploadModal;
