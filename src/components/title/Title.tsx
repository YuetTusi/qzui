import React, { PropsWithChildren } from 'react';
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
            {props.returnText ? <a onClick={props.onReturn}>{props.returnText}</a> : ""}
        </span>
        <span>{props.children}</span>
        <span className="btn">
            {props.okText ? <a onClick={props.onOk}>{props.okText}</a> : ""}
        </span>
    </div>
}

export default Title;