import React, { FC } from 'react';
import Button from 'antd/lib/button';
import './Title.less';

interface Prop {
    //右侧按钮文本
    okText?: string;
    //右侧按钮回调
    onOk?: () => any;
    //OK按钮属性
    okButtonProps?: ButtonProps;
    //返回按钮文本
    returnText?: string;
    //返回按钮回调
    onReturn?: () => any;
    //返回按钮属性
    returnButtonProps?: ButtonProps;
}

interface ButtonProps {
    /**
     * 是否禁用
     */
    disabled?: boolean;
    /**
     * 按钮Icon
     */
    icon?: string;
}

/**
 * 标题栏
 */
const Title: FC<Prop> = (props) => <div className="title-bar">
    <span className="back">
        {props.returnText
            ?
            <Button
                type="primary"
                onClick={props.onReturn}
                icon={props?.returnButtonProps?.icon}>
                {props.returnText}
            </Button>
            :
            ""}
    </span>
    <span className="center-text">{props.children}</span>
    <span className="btn">
        {props.okText
            ?
            <Button
                type="primary"
                onClick={props.onOk}
                icon={props?.okButtonProps?.icon}
                disabled={props?.okButtonProps?.disabled}>
                {props.okText}
            </Button>
            :
            ""}
    </span>
</div>;

export default Title;