import React, { FC, useEffect, useState, memo } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';
import huaweiHisuite from './images/fetch/huawei_hisuite.jpg';
import huaweiBackup from './images/fetch/huawei_backup.jpg';
import meizuBackup from './images/fetch/meizu_backup.jpg';
import oppoBackup from './images/fetch/oppo_backup.jpg';
import oppoWiFi from './images/fetch/oppo_wifi.jpg';
import vivoBackup from './images/fetch/vivo_backup.jpg';
import miBackup from './images/fetch/mi_backup.jpg';
import './HelpModal.less';

const { TabPane } = Tabs;

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 默认选项卡
     */
    defaultTab?: string;
    /**
     * 确定回调
     */
    okHandle?: () => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

/**
 * 帮助提示框
 */
const HelpModal: FC<Prop> = props => {

    const [modalWidth, setModalWidth] = useState<number>(1240);

    useEffect(() => {
        setModalWidth(Number(sessionStorage.getItem('WindowWidth')) - 100);
    }, [props.visible]);

    return <Modal
        visible={props.visible}
        footer={[
            <Button
                type="primary"
                icon="check-circle"
                onClick={() => {
                    props.okHandle!();
                }}>确定</Button>
        ]}
        width={modalWidth}
        title="数据备份帮助"
        closable={false}
        destroyOnClose={true}
        maskClosable={false}
        centered={true}
        className="debug-help-modal-root">
        <Tabs
            defaultActiveKey={props.defaultTab}
            tabPosition="left">
            <TabPane tab="小米" key={'mi-backup'}>
                <div className="flow">
                    <img src={miBackup} />
                </div>
            </TabPane>
            <TabPane tab="华为" key={'huawei-backup'}>
                <div className="flow">
                    <img src={huaweiBackup} />
                </div>
            </TabPane>
            <TabPane tab="华为Hisuite" key={'huawei-hisuite'}>
                <div className="flow">
                    <img src={huaweiHisuite} />
                </div>
            </TabPane>
            <TabPane tab="OPPO" key={'oppo-backup'}>
                <div className="flow">
                    <img src={oppoBackup} />
                </div>
            </TabPane>
            <TabPane tab="OPPO WiFi" key={'oppo-wifi'}>
                <div className="flow">
                    <img src={oppoWiFi} />
                </div>
            </TabPane>
            <TabPane tab="VIVO" key={'vivo-backup'}>
                <div className="flow">
                    <img src={vivoBackup} />
                </div>
            </TabPane>
            <TabPane tab="魅族" key={'meizu-backup'}>
                <div className="flow">
                    <img src={meizuBackup} />
                </div>
            </TabPane>
        </Tabs>
    </Modal>;
};

HelpModal.defaultProps = {
    visible: false,
    defaultTab: 'mi',
    cancelHandle: () => { }
};

export default memo(HelpModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
