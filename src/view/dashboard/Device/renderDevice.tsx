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
                            flash: device[i].tipType === TipType.Question || device[i].tipType === TipType.RequiredGuide
                        })}>
                        <div>
                            <i className="terminal" />
                            <span>{`终端${i + 1}`}</span>
                        </div>
                        <div>
                            <MsgLink
                                {...device[i]}
                                show={device[i].tipType !== TipType.Nothing}
                                flash={false}
                                // flash={device[i].tipType === TipType.Guide}
                                clickHandle={context.msgLinkHandle}>
                                {getLinkTxt(device[i].tipType!)}
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
 * 链接文本
 */
function getLinkTxt(type: TipType) {
    let txt: string;
    switch (type) {
        case TipType.Question:
            txt = '操作确认';
            break;
        case TipType.RequiredGuide:
            txt = '备份数据';
            break;
        case TipType.Guide:
            txt = '消息';
            break;
        default:
            txt = '消息'
            break;
    }
    return txt;
}

/**
 * 排布设备行列
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