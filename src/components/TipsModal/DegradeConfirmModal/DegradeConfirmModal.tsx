import React, { SFC, memo } from 'react';
import Button from 'antd/lib/button';
import Divider from 'antd/lib/divider';
import Modal from 'antd/lib/modal';
import { withModeButton } from '@src/components/enhance';
import degrade_1 from './images/degrade_1.png';
import degrade_2 from './images/degrade_2.png';
import './DegradeConfirmModal.less';

const ModeButton = withModeButton()(Button);

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 确认回调
     */
    okHandle: () => void;
}

/**
 * 降级备份用户确认
 * 此弹框必须用户点击才可继续流程
 */
const DegradeConfirmModal: SFC<Prop> = (props: Prop) => {
    return <Modal
        footer={[
            <ModeButton type="primary"
                icon="check-circle"
                onClick={() => props.okHandle()}>
                确定
            </ModeButton>
        ]}
        visible={props.visible}
        centered={true}
        maskClosable={false}
        closable={false}
        width={950}>
        <div className="degrade-confirm-modal-root">
            <div className="title">降级备份提示</div>
            <Divider />
            <div className="content">
                <div className="imgs">
                    <img src={degrade_1} alt="降级备份1" />
                    <img src={degrade_2} alt="降级备份2" />
                </div>
                <div className="txt">
                    <span className="sub-tit"></span>
                    <ol>
                        <li>重启后请解锁手机</li>
                        <li>打开<em>保持唤醒状态</em></li>
                        <li>操作完成后，点击确定</li>
                        <li>确定后，在手机上点击<em>备份我的数据</em></li>
                    </ol>
                </div>
            </div>
        </div>
    </Modal>;
}

export default memo(DegradeConfirmModal);
