import React from "react";
import classnames from 'classnames';
import DeviceInfo from "@src/components/DeviceInfo/DeviceInfo";
import MsgLink from "@src/components/MsgLink/MsgLink";
import { FetchState } from "@src/schema/socket/DeviceState";
import TipType from "@src/schema/socket/TipType";
import DeviceType from "@src/schema/socket/DeviceType";
import { helper } from "@src/utils/helper";

const { max } = helper.readConf();

/**
 * 渲染手机设备列表
 * @param device 设备列表
 * @param context 上下文
 */
function renderDevices(device: DeviceType[], context: any) {

    if (helper.isNullOrUndefined(device)) {
        return [];
    }
    let dom: Array<JSX.Element> = [];
    for (let i = 0; i < max; i++) {
        if (device[i] === undefined) {
            dom.push(<div className="col" key={helper.getKey()}>
                <div className="cell">
                    <div className={classnames({ no: true, flash: false })}>
                        <div>
                            <i className="terminal" />
                            <span>{`终端${i + 1}`}</span>
                        </div>
                    </div>
                    <div className="place">
                        <DeviceInfo
                            fetchState={FetchState.Waiting}
                            collectHandle={context.collectHandle}
                            errorHandle={context.errorHandle}
                            stopHandle={context.stopHandle} />
                    </div>
                </div>
            </div>);
        } else {
            dom.push(<div className="col" key={helper.getKey()}>
                <div className="cell">
                    <div
                        className={classnames({
                            no: true,
                            flash: device[i].tip !== TipType.Nothing
                        })}>
                        <div>
                            <i className="terminal" />
                            <span>{`终端${i + 1}`}</span>
                        </div>
                        <div>
                            <MsgLink
                                {...device[i]}
                                show={device[i].tip !== TipType.Nothing}
                                clickHandle={context.msgLinkHandle}>
                                消息
                                </MsgLink>
                        </div>
                    </div>
                    <div className="place">
                        <DeviceInfo
                            {...device[i]}
                            collectHandle={context.collectHandle}
                            errorHandle={context.errorHandle}
                            stopHandle={context.stopHandle} />
                    </div>
                </div>
            </div>);
        }
    }
    return dom;
}

/**
 * 
 * @param cols 一列设备数据
 */
function calcRow(cols: JSX.Element[]) {
    if (max <= 6) {
        return <>
            <div className="row">
                {cols.slice(0, Math.trunc(max / 2))}
            </div>
            <div className="row">
                {cols.slice(Math.trunc(max / 2), max)}
            </div>
        </>;
    } else if (max % 3 === 0) {
        let quart = max / 3;
        return <>
            <div className="row">
                {cols.slice(0, quart)}
            </div>
            <div className="row">
                {cols.slice(quart, quart * 2)}
            </div>
            <div className="row">
                {cols.slice(quart * 2, max)}
            </div>
        </>;
    } else {
        return <>
            <div className="row">
                {cols.slice(0, Math.trunc(max / 2))}
            </div>
            <div className="row">
                {cols.slice(Math.trunc(max / 2), max)}
            </div>
        </>;
    }
}

export { renderDevices, calcRow };