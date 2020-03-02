import React, { PropsWithChildren } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
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
     * 进度详情消息
     */
    message: string;
    /**
     * 解析状态（0:解析完成 1:未解析 2:解析中） 
     */
    status: number;
    /**
     * 弹框取消
     */
    cancelHandle: () => void;
}

/**
 * 当前解析详情框
 */
function ParsingStateModal(props: PropsWithChildren<IProp>): JSX.Element {

    /**
     * 渲染状态标签内容
     * @param status 状态码
     */
    function renderTag(status: number): JSX.Element | JSX.Element[] {
        if (status === 0) {
            return <span className="st">解析完成</span>;
        } else {
            return [
                <Icon type="sync" spin={true} />,
                <span className="tag-txt">解析中</span>
            ];
        }
    }

    return <Modal
        visible={props.visible}
        title="解析状态"
        destroyOnClose={true}
        maskClosable={false}
        onCancel={() => {
            props.cancelHandle();
        }}
        footer={[
            <Button
                type="default"
                onClick={props.cancelHandle}
                icon="close-circle">
                取消
            </Button>
        ]}>
        <div className="parsing-state-modal">
            <div className="parsing-panel">
                <div className="box">
                    <div className="title">
                        <Icon type="mobile" />
                        <span>{props.caseName}</span>
                    </div>
                    <div className="phone-info">
                        <span className="txt">设备：{props.phoneName}</span>
                        <Tag color={props.status === 0 ? 'green' : 'blue'}>
                            {renderTag(props.status)}
                        </Tag>
                    </div>
                </div>
                <div className="box">
                    <div className="title">
                        <Icon type="file-sync" />
                        <span>解析详情</span>
                    </div>
                    <div className="content">
                        <div>{props.message}</div>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
}

export default ParsingStateModal;