import React, { SFC, memo } from 'react';
import Modal from 'antd/lib/modal';
import Divider from 'antd/lib/divider';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import './DegradeFailModal.less';

interface Prop {
    visible: boolean;
}

/**
 * 降级备份失败提示框
 */
const DegradeFailModal: SFC<Prop> = (props) => <Modal visible={props.visible}
    centered={true}
    footer={null}
    maskClosable={false}
    closable={false}
    width={600}>
    <div className="degrade-fail-modal">
        <div className="title"><Icon type="exclamation-circle" />降级备份失败</div>
        <Divider />
        <div className="content">
            <h3>降级备份失败，原因可能如下</h3>
            <ol>
                <li>USB断开连接，请检查USB连接</li>
                <li>手机弹框中没有点击允许按钮</li>
                <li>系统不支持降级备份</li>
                <li>手机完全备份界面未点击备份我的数据</li>
            </ol>
            <div className="btn">
                <h3>请根据上述原因进行检查，然后选择</h3>
                <Button type="primary">重试</Button>
                <Tooltip title="跳过将不再采集APP应用数据">
                    <Button type="primary">跳过</Button>
                </Tooltip>
            </div>
        </div>
    </div>
</Modal>;

export default memo(DegradeFailModal);