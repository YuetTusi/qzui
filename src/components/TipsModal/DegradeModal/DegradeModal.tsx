import React, { ReactElement, PropsWithChildren } from 'react';
import { Modal, Divider } from 'antd';
import degradeImg from './images/degrade.png';
import './DegradeModal.less';


interface IProp {
    //是否显示
    visible: boolean;
}

/**
 * 降级备份提示框
 * @param props 
 */
function DegradeModal(props: PropsWithChildren<IProp>): ReactElement {
    return <Modal visible={props.visible}
        centered={true}
        footer={null}
        maskClosable={false}
        closable={false}
        width={1000}>
        <div className="degrade-modal-root">
            <div className="title">备份提示</div>
            <Divider />
            <div className="content">
                <div>
                    <img src={degradeImg} alt="降级备份" />
                </div>


                <div className="txt">
                    <span className="sub-tit">注意事项</span>
                    <ol>
                        <li>备份过程可能时间比较长，请耐心等待。</li>
                        <li>备份过程中，手机会自动重启，手机重启后请注意手机屏幕，<em>确认允许USB调试</em></li>
                        <li>手机重启后，手机弹出如左图所示对话框，<strong>请不要输入密码</strong>，直接<em>点击备份我的数据</em>即可。</li>
                        <li>若备份过程中出现是否允许安装应用，请<em>一律点击允许按钮。</em></li>
                        <li>请勿退出手机端备份界面，以免导致备份失败。</li>
                        <li>备份完成后，手机需要恢复数据，稍等片刻后即可恢复完成。</li>
                    </ol>
                </div>
            </div>
        </div>

    </Modal>
}

export default DegradeModal;