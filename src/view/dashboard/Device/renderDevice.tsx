import React from 'react';
import classnames from 'classnames';
import { helper } from '@utils/helper';
import DeviceType from '@src/schema/socket/DeviceType';
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
		elements = elements.concat([
			<DeviceFrame
				key={`F_${i}`}
				data={device[i]}
				no={i + 1}
				collectHandle={context.collectHandle}
				serverCloudHandle={context.serverCloudHandle}
				stopHandle={context.stopHandle}
				errorHandle={context.errorHandle}
				msgLinkHandle={context.msgLinkHandle}
				userHelpHandle={context.userHelpHandle}
				screenCastHandle={context.screenCastHandle}
			/>
		]);
	}
	return elements;
}

/**
 * 排布设备行列
 * 当采集路数为3倍数显示为3行，否则为2行
 * @param cols 设备DOM
 */
function calcRow(cols: JSX.Element[]) {
	if (max === 1) {
		return (
			<>
				<div
					className={classnames({
						row: true,
						pad: true
					})}>
					{cols}
				</div>
			</>
		);
	} else if (max >= 2 && max <= 6) {
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
