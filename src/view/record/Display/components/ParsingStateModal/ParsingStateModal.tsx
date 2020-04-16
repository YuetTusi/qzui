import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
import Modal from 'antd/lib/modal';
import { ParsingStatus } from '@src/schema/UIRetOneInfo';
import './ParsingModal.less';

interface Prop {
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
     * 解析状态
     */
    status: ParsingStatus;
    /**
     * 弹框取消
     */
    cancelHandle: () => void;
}

/**
 * 当前解析详情框
 */
const ParsingStateModal: FC<Prop> = (props) => {

    /**
     * 渲染状态标签内容
     * @param status 状态码
     */
    const renderTag = (status: ParsingStatus) => {
        if (status === ParsingStatus.SUCCESS) {
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
                关闭详情
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
                        <Tag color={props.status === ParsingStatus.SUCCESS ? 'green' : 'blue'}>
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