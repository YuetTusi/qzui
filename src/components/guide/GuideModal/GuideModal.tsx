import React, { FC, memo } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import GuideImage from '@src/schema/socket/GuideImage';
import DeviceType from '@src/schema/socket/DeviceType';
import { getImages } from './getImages';
import './GuideModal.less';

interface Prop extends DeviceType {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 标题文字
     */
    title?: string;
    /**
     * 是回调
     */
    yesHandle: (data: DeviceType) => void;
    /**
     * 否回调
     */
    noHandle: (data: DeviceType) => void;
};

/**
 * 提示消息引导图示框
 * @param props 
 */
const GuideModal: FC<Prop> = (props) => {

    return <Modal
        visible={props.visible}
        title={props.tipMsg}
        footer={[
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
        ]}
        width={1220}
        destroyOnClose={true}
        maskClosable={false}
        closable={false}
        className="guide-modal-root">
        <div className="flow">
            <img src={getImages(props.tipType!)} />
        </div>
    </Modal>;
};

GuideModal.defaultProps = {
    visible: false,
    title: '请按提示进行操作',
    type: GuideImage.InstallApk,
    yesHandle: () => { },
    noHandle: () => { }
};

export default memo(GuideModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
