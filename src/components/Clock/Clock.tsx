import React, { FC, useState, memo } from 'react';
import { IpcRendererEvent } from 'electron';
import classnames from 'classnames';
import { useSubscribe } from '@src/hooks';
import { helper } from '@utils/helper';
import './Clock.less';

interface Prop {
	/**
	 * USB序号（从0开始）
	 */
	usb: number;
	/**
	 * 操作系统
	 */
	system: string;
}

const prevTimeStringMap = new Map<number, string>();
const { max } = helper.readConf();

for (let i = 0; i < max; i++) {
	prevTimeStringMap.set(i, '00:00:00');
}

/**
 * 计时时钟 (时钟序号从0开始)
 */
const Clock: FC<Prop> = ({ usb, system }) => {
	const [timeString, setTimeString] = useState<string>(prevTimeStringMap.get(usb)!);

	const timeHandle = (event: IpcRendererEvent, currentUsb: number, timeString: string) => {
		if (usb === currentUsb) {
			setTimeString(timeString);
			prevTimeStringMap.set(usb, timeString);
		}
	};

	useSubscribe('receive-time', timeHandle);

	return (
		<div
			className={classnames({
				'clock-color': true,
				pad: max <= 2,
				green: system === 'android'
			})}>
			{timeString}
		</div>
	);
};

Clock.defaultProps = {
	usb: 0,
	system: 'android'
};

export default memo(Clock);
