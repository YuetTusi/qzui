import React, { FC, memo } from 'react';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { Prop } from './componentType';
import { getImages } from './getImages';
import { helper } from '@src/utils/helper';
import FooterButtons from './FooterButtons';
import './GuideModal.less';

/**
 * 提示消息引导图示框
 * @param props 
 */
const GuideModal: FC<Prop> = (props) => {

    /**
     * 渲染内容区
     */
    const renderContent = (): JSX.Element | string => {

        if (helper.isNullOrUndefinedOrEmptyString(props.tipContent)) {
            //图示消息
            let imgPath = getImages(props.tipImage!);
            if (imgPath === null) {
                return <div className="flow"><Empty description="暂无图示" /></div>;
            } else {
                return <div className="flow"><img src={imgPath} /></div>;
            }
        } else {
            //文本消息
            return <div className="text">{props.tipContent}</div>;
        }
    }

    return <Modal
        visible={props.visible}
        title={props.tipTitle}
        onCancel={props.cancelHandle}
        footer={
            <FooterButtons
                {...props}
                yesHandle={props.yesHandle}
                noHandle={props.noHandle} />
        }
        width={helper.isNullOrUndefinedOrEmptyString(props.tipContent) ? 1220 : 400}
        destroyOnClose={true}
        maskClosable={false}
        closable={true}
        className="guide-modal-root">
        {renderContent()}
    </Modal>;
};

GuideModal.defaultProps = {
    visible: false,
    yesHandle: () => { },
    noHandle: () => { },
    cancelHandle: () => { }
};

export default memo(GuideModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
