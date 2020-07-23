import React from "react";
import DeviceType from "@src/schema/socket/DeviceType";
import { helper } from "@src/utils/helper";
import DeviceFrame from './components/DeviceFrame/DeviceFrame';

const { max } = helper.readConf();

/**
 * 渲染手机设备框 (配置文件的最大数量)
 * @param device 设备列表
 * @param context this上下文
 * @returns 组件数组
 */
function renderDevices(device: DeviceType[], context: Record<string, any>) {

    if (helper.isNullOrUndefined(device)) {
        return [];
    }
    let dom: Array<JSX.Element> = [];
    for (let i = 0; i < max; i++) {
        dom.push(<DeviceFrame
            data={device[i]}
            no={i + 1}
            collectHandle={context.collectHandle}
            stopHandle={context.stopHandle}
            errorHandle={context.errorHandle}
            msgLinkHandle={context.msgLinkHandle} />);
    }
    return dom;
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