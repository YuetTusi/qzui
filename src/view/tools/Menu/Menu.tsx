import path from 'path';
import { remote } from 'electron';
import React, { FC, useEffect, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import classnames from 'classnames';
import { fetcher } from '@src/service/rpc';
import Modal from 'antd/lib/Modal';
import Spin from 'antd/lib/spin';
import message from 'antd/lib/message';
import ImportDataModal from './components/ImportDataModal/ImportDataModal';
import FtpUploadModel from './components/FtpUploadModal/FtpUploadModal';
import CImportDataInfo from '@src/schema/CFetchDataInfo';
import { helper } from '@utils/helper';
import { StoreComponent } from '@src/type/model';
import { MenuStoreState } from '@src/model/tools/Menu/Menu';
import './Menu.less';

const config = helper.readConf();

interface Prop extends StoreComponent {
    /**
     * 仓库数据
     */
    menu: MenuStoreState;
}

let publishPath: string = remote.app.getAppPath();

/**
 * 工具箱菜单
 * @param props 属性
 */
const Menu: FC<Prop> = (props) => {

    const [isLoading, setLoading] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [importDataModalVisible, setImportDataModalVisible] = useState<boolean>(false);
    const [ftpUploadModalVisible, setFtpUploadModalVisible] = useState<boolean>(false);

    useEffect(() => {
        const { dispatch } = props;
        dispatch({ type: 'menu/queryFtpConfig' });
    }, []);

    /**
     * 口令工具Click
     * @param e 事件对象
     */
    const passwordToolsClick = (e: MouseEvent<HTMLAnchorElement>) => {
        helper
            .runExe(path.resolve(publishPath, '../../../tools/PasswordTool/passtool.exe'))
            .catch((errMsg: string) => {
                console.log(errMsg);
                Modal.error({
                    title: '启动失败',
                    content: '口令工具启动失败，请联系技术支持',
                    okText: '确定'
                })
            });
    }

    /**
     * 导入第三方数据回调
     * @param data CImportDataInfo数据
     */
    const importDataModalSaveHandle = (data: CImportDataInfo) => {
        setLoading(true);
        fetcher.invoke<void>('ImportThirdData', [data]).then(() => {
            message.success('导入成功');
            setImportDataModalVisible(false);
        }).catch((err: Error) => {
            message.error('导入失败');
        }).finally(() => {
            setLoading(false);
        });
    }
    /**
     * 关闭导入弹框
     */
    const importDataModalCancelHandle = () => {
        setImportDataModalVisible(false);
    }

    /**
     * 上传BCP文件回调
     * @param fileList BCP文件列表
     */
    const bcpUploadHandle = debounce((fileList: string[]) => {
        const { ip, port, username, password } = props.menu;
        setUploading(true);
        //LEGACY: 在此修改BCPexe文件路径
        //note:格式：BcpFtp.exe 127.0.0.1 21 user pwd / file1 file2 file3
        console.log(path.resolve(publishPath, '../../../tools/BcpFtp/BcpFtp.exe'));
        console.log([
            ip, port.toString(), username, password, '/', ...fileList
        ]);
        helper.runExe(path.resolve(publishPath, '../../../tools/BcpFtp/BcpFtp.exe'), [
            ip, port.toString(), username, password, '/', ...fileList
        ]).then(() => {
            message.success('上传成功');
            setUploading(true);
            setFtpUploadModalVisible(false);
        }).catch(err => {
            message.success('上传失败');
            setUploading(true);
        });
    }, 600, { leading: true, trailing: false });

    return <div className="tools-menu">
        <menu className={classnames({ pad: config.max <= 2 })}>
            <li>
                <Spin tip="正在打口令工具, 请稍候..." spinning={false}>
                    <a onClick={debounce(passwordToolsClick, 600, { leading: true, trailing: false })}>
                        <i className="lock"></i>
                        <div className="info">
                            <span>口令工具</span>
                            <em>获取锁屏密码</em>
                        </div>
                    </a>
                </Spin>
            </li>
            <li>
                <a onClick={() => Modal.info({ title: 'BCP生成', content: '新功能，敬请期待', okText: '确定' })}>
                    <i className="bcp"></i>
                    <div className="info">
                        <span>BCP生成</span>
                        <em>将报告文件生成BCP文件</em>
                    </div>
                </a>
            </li>
            <li>
                <a onClick={() => {
                    if (helper.isNullOrUndefinedOrEmptyString(props.menu.ip)) {
                        message.info('未配置FTP，请在设置→FTP配置中进行设置')
                    } else {
                        setFtpUploadModalVisible(true);
                    }
                }}>
                    <i className="upload"></i>
                    <div className="info">
                        <span>BCP上传</span>
                        <em>将案件上传到指定FTP服务器</em>
                    </div>
                </a>
            </li>
            {/* <li>
                <a onClick={reportClick}>
                    <i className="report"></i>
                    <div className="info">
                        <span>报告生成</span>
                        <em>将案件生成HTML报告</em>
                    </div>
                </a>
            </li> */}
            <li>
                <a onClick={() => setImportDataModalVisible(true)}>
                    <i className="indata"></i>
                    <div className="info">
                        <span>导入数据</span>
                        <em>导入第三方数据进行解析</em>
                    </div>
                </a>
            </li>
            <li>
                <a onClick={() => Modal.info({ title: '华为高级采集工具', content: '新功能，敬请期待', okText: '确定' })}>
                    <i className="huawei"></i>
                    <div className="info">
                        <span>华为高级采集工具</span>
                        <em></em>
                    </div>
                </a>
            </li>
            <li>
                <a onClick={() => Modal.info({ title: 'SIM卡取证', content: '新功能，敬请期待', okText: '确定' })}>
                    <i className="sim"></i>
                    <div className="info">
                        <span>SIM卡取证</span>
                        <em></em>
                    </div>
                </a>
            </li>
        </menu>
        <ImportDataModal
            isLoading={isLoading}
            visible={importDataModalVisible}
            saveHandle={importDataModalSaveHandle}
            cancelHandle={importDataModalCancelHandle} />
        <FtpUploadModel
            visible={ftpUploadModalVisible}
            loading={uploading}
            uploadHandle={bcpUploadHandle}
            cancelHandle={() => setFtpUploadModalVisible(false)}
        />
    </div>;
}

export default connect((state: any) => ({ menu: state.menu }))(Menu);