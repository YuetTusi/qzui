import React, { SFC, memo } from 'react';
import Modal from 'antd/lib/modal';
import Icon from 'antd/lib/icon';
import { SystemType } from '@src/schema/SystemType';
import { ConnectState } from '@src/schema/ConnectState';
import { Prop } from './ComponentType';
import './DetailModal.less';

/**
 * 采集详情弹框
 */
const DetailModal: SFC<Prop> = (props) => {

    /**
     * 渲染手机图像
     */
    const renderIcon = () => {
        const { message } = props;
        if (message === null) {
            return <Icon type="sync" spin={true} className="sync" />;
        } else if (message.m_spif.m_ConnectSate === ConnectState.FETCHEND) {
            return <Icon type="check-circle" spin={false} className="check-circle" />;
        } else {
            return <Icon type="sync" spin={true} className="sync" />;
        }
    }

    /**
     * 渲染手机图class样式
     */
    const getPhoneClassName = () => {
        const { message } = props;
        if (message === null) {
            return 'android';
        } else if (message.m_spif.piSystemType === SystemType.IOS) {
            return 'iphone';
        } else {
            return 'android';
        }
    }

    /**
     * 渲染手机详情信息
     */
    const renderPhoneInfo = () => {
        const { message } = props;
        if (message === null) {
            return <ul>
                <li><label>品牌：</label><span></span></li>
                <li><label>型号：</label><span></span></li>
                <li><label>序列号：</label><div></div></li>
                <li><label>物理USB端口号：</label><div></div></li>
            </ul>;
        } else {
            return <ul>
                <li><label>品牌：</label><span>{message.m_spif.piBrand}</span></li>
                <li><label>型号：</label><span>{message.m_spif.piModel}</span></li>
                <li><label>序列号：</label><div>{message.m_spif.piSerialNumber}</div></li>
                <li><label>物理USB端口号：</label><div>{message.m_spif.piLocationID}</div></li>
            </ul>;
        }
    }

    /**
     * 渲染采集状态
     */
    const renderMessage = () => {
        const { message } = props;
        if (message === null) {
            return <div className="tip">
                <strong className="fetching">正在采集数据...</strong>
                <div className="now">
                    <div>正在读取采集进度...</div>
                </div>
            </div>;
        } else if (message.m_spif.m_ConnectSate === ConnectState.FETCHEND) {
            return <div className="tip">
                <strong className="finish">取证完成</strong>
                <div className="now">
                    <div></div>
                </div>
            </div>;
        } else {
            return <div className="tip">
                <strong className="fetching">正在采集数据...</strong>
                <div className="now">
                    <div>{message.m_strDescription}</div>
                </div>
            </div>;
        }
    }

    return <Modal
        title="取证详情"
        visible={props.visible}
        width={800}
        okButtonProps={{ style: { display: 'none' } }}
        cancelText="关闭详情"
        cancelButtonProps={{ icon: 'close-circle' }}
        onCancel={props.cancelHandle}>
        <div className="detail-modal-root">
            <div className="col">
                <div className="panel">
                    <div className="title">
                        <Icon type="mobile" />
                        <span>设备</span>
                    </div>
                    <div className="row-content">
                        <div className="left">
                            <i className={`phone-type ${getPhoneClassName()}`}>
                                {renderIcon()}
                            </i>
                        </div>
                        <div className="right">
                            {renderPhoneInfo()}
                        </div>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="panel">
                    <div className="title">
                        <Icon type="file-sync" />
                        <span>采集状态</span>
                    </div>
                    <div className="col-content">
                        {renderMessage()}
                    </div>
                </div>
            </div>
        </div>
    </Modal>;
};

export default memo(DetailModal,
    (prevProps: Prop, nextProps: Prop) =>
        prevProps.visible === nextProps.visible && prevProps.message?.m_strDescription === nextProps.message?.m_strDescription);