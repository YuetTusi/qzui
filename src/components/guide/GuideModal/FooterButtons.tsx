import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { withModeButton } from '@src/components/enhance';
import { helper } from '@src/utils/helper';
import DeviceType from '@src/schema/socket/DeviceType';

const ModeButton = withModeButton()(Button);

interface Prop extends DeviceType {
    /**
     * 是回调 
     */
    yesHandle: (value: any, data: DeviceType) => void;
    /**
     * 否回调
     */
    noHandle: (value: any, data: DeviceType) => void;
}

/**
 * GuideModal框按钮
 */
const FooterButtons: FC<Prop> = (props) => {

    let buttons: JSX.Element[] = [];

    if (!helper.isNullOrUndefined(props.tipNoButton)) {
        buttons.push(
            <ModeButton onClick={() => {
                if (props.tipNoButton?.confirm) {
                    Modal.confirm({
                        content: props.tipNoButton?.confirm,
                        onOk() {
                            props.noHandle(props.tipNoButton?.value, props);
                        },
                        okText: '是',
                        cancelText: '否',
                        centered: true
                    });
                } else {
                    props.noHandle(props.tipNoButton?.value, props);
                }
            }}
                type="default">
                {props.tipNoButton?.name}
            </ModeButton>
        );
    }
    if (!helper.isNullOrUndefined(props.tipYesButton)) {
        buttons.push(
            <ModeButton onClick={() => {
                if (props.tipYesButton?.confirm) {
                    Modal.confirm({
                        content: props.tipYesButton?.confirm,
                        onOk() {
                            props.yesHandle(props.tipYesButton?.value, props);
                        },
                        okText: '是',
                        cancelText: '否',
                        centered: true
                    });
                } else {
                    props.yesHandle(props.tipYesButton?.value, props);
                }
            }}
                type="primary">
                {props.tipYesButton?.name}
            </ModeButton>
        );
    }
    if (buttons.length === 0) {
        return null;
    } else {
        return <>{buttons}</>;
    }
};

export default FooterButtons;
