import path from 'path';
import { remote } from 'electron';
import React, { FC, useEffect, useState, MouseEvent } from 'react';
import debounce from 'lodash/debounce';
import classnames from 'classnames';
import { fetcher } from '@src/service/rpc';
import Modal from 'antd/lib/Modal';
import Spin from 'antd/lib/spin';
import message from 'antd/lib/message';
import ImportDataModal from './components/ImportDataModal/ImportDataModal';
import CImportDataInfo from '@src/schema/CFetchDataInfo';
import { helper } from '@utils/helper';
import './Menu.less';

const config = helper.getConfig();

interface Prop { }

let publishPath: string = remote.app.getAppPath();

/**
 * 工具箱菜单
 * @param props 属性
 */
const Menu: FC<Prop> = (props) => {

    const [isLoading, setLoading] = useState<boolean>(false);
    const [importDataModalVisible, setImportDataModalVisible] = useState<boolean>(false);

    /**
     * 口令工具Click
     * @param e 事件对象
     */
    const passwordToolsClick = (e: MouseEvent<HTMLAnchorElement>) => {
        const { defenderPath } = config;
        helper
            .runExe(path.resolve(publishPath, '../../../', defenderPath))
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
     * 报告生成Click
     * @param e 事件
     */
    // const reportClick = (e: MouseEvent<HTMLAnchorElement>) => {
    //     const { readerPath } = config as any;
    //     runExe(path.resolve(publishPath, '../../../', readerPath));
    // }

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
                <a onClick={() => Modal.info({ title: 'BCP上传', content: '新功能，敬请期待', okText: '确定' })}>
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
    </div>;
}

export default Menu;