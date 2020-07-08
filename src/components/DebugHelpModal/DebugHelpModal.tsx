import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';
import './DebugHelpModal.less';
import { helper } from '@src/utils/helper';

const { TabPane } = Tabs;

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

/**
 * 帮助提示框
 */
const DebugHelpModal: FC<Prop> = (props) => {

    return <Modal
        visible={props.visible}
        footer={[
            <Button
                type="primary"
                icon="check-circle"
                onClick={() => props.cancelHandle!()}>确定</Button>
        ]}
        width={1200}
        closable={false}
        maskClosable={false}
        centered={true}
        className="debug-help-modal-root">
        <Tabs tabPosition="left" style={{ height: '600px' }}>
            <TabPane tab="小米" key={helper.getKey()}>
                <div className="flow">小米</div>
            </TabPane>
            <TabPane tab="华为" key={helper.getKey()}>
                <div className="flow">华为</div>
            </TabPane>
            <TabPane tab="OPPO" key={helper.getKey()}>
                <div className="flow">OPPO</div>
            </TabPane>
            <TabPane tab="VIVO" key={helper.getKey()}>
                <div className="flow">VIVO</div>
            </TabPane>
            <TabPane tab="三星" key={helper.getKey()}>
                <div className="flow">三星</div>
            </TabPane>
            <TabPane tab="三星" key={helper.getKey()}>
                <div className="flow">三星</div>
            </TabPane>
            <TabPane tab="魅族" key={helper.getKey()}>
                <div className="flow">魅族</div>
            </TabPane>
            <TabPane tab="努比亚" key={helper.getKey()}>
                <div className="flow">努比亚</div>
            </TabPane>
            <TabPane tab="一加" key={helper.getKey()}>
                <div className="flow">一加</div>
            </TabPane>
            <TabPane tab="联想" key={helper.getKey()}>
                <div className="flow">联想</div>
            </TabPane>
            <TabPane tab="锤子" key={helper.getKey()}>
                <div className="flow">锤子</div>
            </TabPane>
            <TabPane tab="摩托罗拉" key={helper.getKey()}>
                <div className="flow">摩托罗拉</div>
            </TabPane>
            <TabPane tab="飞利浦" key={helper.getKey()}>
                <div className="flow">飞利浦</div>
            </TabPane>
            <TabPane tab="索尼" key={helper.getKey()}>
                <div className="flow">索尼</div>
            </TabPane>
            <TabPane tab="LG" key={helper.getKey()}>
                <div className="flow">LG</div>
            </TabPane>
            <TabPane tab="金立" key={helper.getKey()}>
                <div className="flow">金立</div>
            </TabPane>
            <TabPane tab="HTC" key={helper.getKey()}>
                <div className="flow">HTC</div>
            </TabPane>
        </Tabs>
    </Modal>;
};

DebugHelpModal.defaultProps = {
    visible: false,
    cancelHandle: () => { }
};

export default DebugHelpModal;
