import React, { FC, memo } from 'react';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { withModeButton } from '@src/components/ModeButton/modeButton';
import { Prop } from './componentType';
import { getImages } from './getImages';
import './GuideModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 提示消息引导图示框
 * @param props 
 */
const GuideModal: FC<Prop> = (props) => {

    /**
     * 渲染按钮区
     */
    const renderFooter = () => {
        if (props.tipRequired) {
            return [
                <ModeButton type="default" onClick={() => {
                    Modal.confirm({
                        title: '请确认',
                        content: '点击否后会影响取证流程，确认吗？',
                        okText: '确定',
                        cancelText: '取消',
                        centered: true,
                        onOk() {
                            props.noHandle(props);
                        }
                    });
                }}>否</ModeButton>,
                <ModeButton type="primary" onClick={() => props.yesHandle(props)}>是</ModeButton>
            ]
        } else {
            return null;
        }
    };

    /**
     * 渲染提示图
     */
    const renderImage = () => {
        let imgPath = getImages(props.tipImage!);
        if (imgPath === null) {
            return <Empty description="暂无提示" />
        } else {
            return <img src={imgPath} />
        }
    }

    return <Modal
        visible={props.visible}
        title={props.tipMsg || '请按提示进行操作'}
        onCancel={props.cancelHandle}
        footer={renderFooter()}
        width={1220}
        destroyOnClose={true}
        maskClosable={false}
        closable={!props.tipRequired}
        className="guide-modal-root">
        <div className="flow">
            {renderImage()}
        </div>
    </Modal>;
};

GuideModal.defaultProps = {
    visible: false,
    title: '请按提示进行操作',
    type: undefined,
    yesHandle: () => { },
    noHandle: () => { },
    cancelHandle: () => { }
};

export default memo(GuideModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
