import React, { PropsWithChildren } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import './ParsingModal.less';

interface IProp {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 案件名称
     */
    caseName: string;
    /**
     * 当前详情手机名
     */
    phoneName: string;
    /**
     * 弹框取消
     */
    cancelHandle: () => void;
}

/**
 * 当前解析详情框
 */
function ParsingStateModal(props: PropsWithChildren<IProp>): JSX.Element {
    return <Modal
        visible={props.visible}
        title="解析状态"
        destroyOnClose={true}
        maskClosable={false}
        onCancel={props.cancelHandle}
        footer={[
            <Button type="default" onClick={props.cancelHandle} icon="close-circle">取消</Button>
        ]}>
        <div className="parsing-state-modal">
            <div className="parsing-panel">
                <div className="box">
                    <div className="title">
                        <Icon type="mobile" />
                        <span>{props.caseName}</span>
                    </div>
                    <div className="content">
                        手机：{props.phoneName}
                    </div>
                </div>
                <div className="box">
                    <div className="title">
                        <Icon type="file-sync" />
                        <span>解析详情</span>
                    </div>
                    <div className="content">
                        正在解析微信...
                    </div>
                </div>
            </div>
        </div>
    </Modal>
}

export default ParsingStateModal;