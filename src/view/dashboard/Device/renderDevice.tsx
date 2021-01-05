import React from 'react';
import classnames from 'classnames';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import DeviceFrame from './components/DeviceFrame/DeviceFrame';
import { Context } from './ComponentType';

const { max } = helper.readConf();

/**
 * 渲染手机设备框 (配置文件的最大数量)
 * @param device 设备列表
 * @param context this上下文
 * @returns 组件数组
 */
function renderDevices(device: DeviceType[], context: Context) {
	if (helper.isNullOrUndefined(device)) {
		return new Array(max);
	}
	let elements: Array<JSX.Element> = [];
	for (let i = 0; i < max; i++) {
		elements.push(
			<DeviceFrame
				data={device[i]}
				no={i + 1}
				collectHandle={context.collectHandle}
				stopHandle={context.stopHandle}
				errorHandle={context.errorHandle}
				msgLinkHandle={context.msgLinkHandle}
				userHelpHandle={context.userHelpHandle}
			/>
		);
	}
	return elements;
}

/**
 * 排布设备行列
 * @param cols 一列设备数据
 */
function calcRow(cols: JSX.Element[]) {
	if (max <= 6) {
		return (
			<>
				<div
					className={classnames({
						row: true,
						pad: max === 2
					})}>
					{cols.slice(0, Math.trunc(max / 2))}
				</div>
				<div
					className={classnames({
						row: true,
						pad: max === 2
					})}>
					{cols.slice(Math.trunc(max / 2), max)}
				</div>
			</>
		);
	} else if (max % 3 === 0) {
		let quart = max / 3;
		return (
			<>
				<div className="row">{cols.slice(0, quart)}</div>
				<div className="row">{cols.slice(quart, quart * 2)}</div>
				<div className="row">{cols.slice(quart * 2, max)}</div>
			</>
		);
	} else {
		return (
			<>
				<div className="row">{cols.slice(0, Math.trunc(max / 2))}</div>
				<div className="row">{cols.slice(Math.trunc(max / 2), max)}</div>
			</>
		);
	}
}

export { renderDevices, calcRow };
