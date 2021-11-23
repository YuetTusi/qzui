import React, { FC, MouseEvent, useCallback, useEffect, useRef } from 'react';
import { Prop } from './componentType';
import './WordSelect.less';

let index = 0;

/**
 * 选字验证码
 * @param props
 * @returns
 */
const WordSelect: FC<Prop> = ({ size, src, width, height, onValid, children }) => {
	const wordPanelRef = useRef<HTMLDivElement>(null);
	const values = useRef<{ x: number; y: number }[]>([]);

	useEffect(() => {
		return () => {
			values.current = [];
			index = 0;
		};
	}, []);

	/**
	 * 加点按标记点
	 * @param val 计数值
	 * @param x X坐标
	 * @param y Y坐标
	 */
	const addPoint = useCallback((val: number, x: number, y: number) => {
		let $mark = document.createElement('div');
		$mark.setAttribute('class', 'count-dot');
		$mark.style.left = `${x - 10}px`;
		$mark.style.top = `${y - 10}px`;
		$mark.innerText = `${val}`;
		wordPanelRef.current?.append($mark);
	}, []);

	/**
	 * 背景图点按Click
	 * @param event Mouse事件
	 */
	const wordImageClick = (event: MouseEvent<HTMLImageElement>) => {
		const { offsetX, offsetY } = event.nativeEvent;
		// console.log(`${offsetX},${offsetY}`);

		if (index < size - 1) {
			values.current = values.current.concat([{ x: offsetX, y: offsetY }]);
			addPoint(index + 1, offsetX, offsetY);
			index++;
		} else if (index === size - 1) {
			values.current = values.current.concat([{ x: offsetX, y: offsetY }]);
			addPoint(index + 1, offsetX, offsetY);
			index++;
			onValid(values.current);
		} else {
			index++;
		}
	};

	return (
		<div className="wordselect-root">
			<div ref={wordPanelRef} className="word-panel">
				<img src={src} width={width} height={height} onClick={wordImageClick} />
			</div>
			{children ? <div className="point-out">{children}</div> : null}
		</div>
	);
};

export default WordSelect;
