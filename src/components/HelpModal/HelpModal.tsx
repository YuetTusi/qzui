import React, { FC, memo } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';
import GuideStep from './GuideStep';
import miBackup from './steps/mi/backup';
import huaweiBackup from './steps/huawei/backup';
import huaweiHisuite from './steps/huawei/backuppc';
import oppoBackup from './steps/oppo/backup';
import oppoWiFi from './steps/oppo/wifi';
import vivoBackup from './steps/vivo/backup';
import meizuBackup from './steps/meizu/backup';
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
const HelpModal: FC<Prop> = (props) => {

    return <Modal
        visible={props.visible}
        footer={[
            <Button
                type="default"
                icon="close-circle"
                onClick={() => props.cancelHandle!()}>取消</Button>,
            <Button
                type="primary"
                icon="check-circle"
                onClick={() => {
                    props.okHandle!();
                    // confirm({
                    //     title: '备份完成？',
                    //     content: '请确认数据已按图示备份完成',
                    //     okText: '是',
                    //     cancelText: '否',
                    //     onOk() {
                    //         props.okHandle!();
                    //     }
                    // });
                }}>确定</Button>
        ]}
        width={1200}
        title="数据备份帮助"
        closable={false}
        destroyOnClose={true}
        maskClosable={false}
        centered={true}
        className="debug-help-modal-root">
        <Tabs
            defaultActiveKey={props.defaultTab}
            tabPosition="left"
            style={{ height: '600px' }}>
            <TabPane tab="小米" key={'mi-backup'}>
                <div className="flow">
                    <GuideStep data={miBackup} />
                </div>
            </TabPane>
            <TabPane tab="华为" key={'huawei-backup'}>
                <div className="flow">
                    <GuideStep data={huaweiBackup} />
                </div>
            </TabPane>
            <TabPane tab="华为Hisuite" key={'huawei-hisuite'}>
                <div className="flow">
                    <GuideStep data={huaweiHisuite} />
                </div>
            </TabPane>
            <TabPane tab="OPPO" key={'oppo-backup'}>
                <div className="flow">
                    <GuideStep data={oppoBackup} />
                </div>
            </TabPane>
            <TabPane tab="OPPO WiFi" key={'oppo-wifi'}>
                <div className="flow">
                    <GuideStep data={oppoWiFi} />
                </div>
            </TabPane>
            <TabPane tab="VIVO" key={'vivo-backup'}>
                <div className="flow">
                    <GuideStep data={vivoBackup} />
                </div>
            </TabPane>
            <TabPane tab="魅族" key={'meizu-backup'}>
                <div className="flow">
                    <GuideStep data={meizuBackup} />
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
