import React, { PropsWithChildren } from 'react';
import Button from 'antd/lib/button';
import './Title.less';

interface IProp {
    //右侧按钮文本
    okText?: string | JSX.Element;
    //右侧按钮回调
    onOk?: () => any;
    //返回按钮文本
    returnText?: string | JSX.Element;
    //返回按钮回调
    onReturn?: () => any;
}

/**
 * @description 标题栏
 */
function Title(props: PropsWithChildren<IProp>) {
    return <div className="title-bar">
        <span className="back">
            {props.returnText ? <Button type="primary" onClick={props.onReturn}>{props.returnText}</Button> : ""}
        </span>
        <span className="center-text">{props.children}</span>
        <span className="btn">
            {props.okText ? <Button type="primary" onClick={props.onOk}>{props.okText}</Button> : ""}
        </span>
    </div>
}

export default Title;