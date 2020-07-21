import React, { FC, memo } from 'react';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import GuideImage from '@src/schema/socket/GuideImage';
import { Prop } from './componentType';
import { getImages } from './getImages';
import './GuideModal.less';

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
                <Button type="default" onClick={() => props.noHandle(props)}>否</Button>,
                <Button type="primary" onClick={() => {
                    Modal.confirm({
                        title: '请确认',
                        content: '是否已按图示操作完成？',
                        okText: '是',
                        cancelText: '否',
                        centered: true,
                        onOk() {
                            props.yesHandle(props);
                        }
                    });
                }}>是</Button>
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
    type: GuideImage.InstallApk,
    yesHandle: () => { },
    noHandle: () => { },
    cancelHandle: () => { }
};

export default memo(GuideModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
