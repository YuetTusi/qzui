import { render } from 'nunjucks';
import React, { FC, MouseEvent, useCallback, useEffect, useRef } from 'react';
import { Prop } from './componentType';
import './WordSelect.less';

let index = 1;

/**
 * 选字验证码
 * @param props
 * @returns
 */
const WordSelect: FC<Prop> = (props) => {
	const { size, src, width, height, onValid } = props;
	const wordPanelRef = useRef<HTMLDivElement>(null);
	const values = useRef<{ x: number; y: number }[]>([]);

	useEffect(() => {
		return () => {
			values.current = [];
			index = 1;
		};
	}, []);

	/**
	 * 加点按标记点
	 * @param val 计数值
	 * @param x X坐标
	 * @param y Y坐标
	 */
	const addPoint = useCallback((val: number, x: number, y: number) => {
		let $dot = document.createElement('div');
		$dot.setAttribute('class', 'count-dot');
		$dot.style.left = `${x - 10}px`;
		$dot.style.top = `${y - 10}px`;
		$dot.innerText = `${val}`;
		wordPanelRef.current?.appendChild($dot);
	}, []);

	const wordImageClick = (event: MouseEvent<HTMLImageElement>) => {
		const { offsetX, offsetY } = event.nativeEvent;
		// console.log(`${offsetX},${offsetY}`);

		if (index < size) {
			values.current = values.current.concat([{ x: offsetX, y: offsetY }]);
			addPoint(index, offsetX, offsetY);
			index++;
		} else if (index === size) {
			values.current = values.current.concat([{ x: offsetX, y: offsetY }]);
			addPoint(index, offsetX, offsetY);
			onValid(values.current);
			index = 1;
			values.current = [];
		} else {
			index = 1;
			values.current = [];
		}
	};

	return (
		<div className="wordselect-root">
			<div ref={wordPanelRef} className="word-panel">
				<img src={src} width={width} height={height} onClick={wordImageClick} />
			</div>
			{props.children ? <div className="point-out">{props.children}</div> : null}
		</div>
	);
};

export { WordSelect };
