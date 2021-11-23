import React, { FC, useRef, memo, useEffect } from 'react';
import Slider, { SliderValue } from 'antd/lib/slider';
import { Gap } from './Gap';
import { Prop } from './componentType';
import './Jigsaw.less';

/**
 * 拼图验证
 */
const Jigsaw: FC<Prop> = ({
	bgSrc,
	gapSrc,
	bgWidth,
	bgHeight,
	gapWidth,
	gapHeight,
	gapInitStyle,
	onPiece
}) => {
	const gapRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		if (gapRef.current) {
			//滑块放到初始位置
			gapRef.current.setAttribute('style', gapInitStyle);
		}
	}, [gapInitStyle]);

	return (
		<div className="jigsaw-root">
			<div className="img-panel">
				<img src={bgSrc} width={bgWidth} height={bgHeight} className="bg" />
				<Gap ref={gapRef} src={gapSrc} width={gapWidth} height={gapHeight} />
			</div>
			<div className="img-slider">
				<Slider
					className="slider-overwrite"
					onChange={(value: SliderValue) => {
						let gap = gapRef.current as HTMLImageElement;
						gap.style.left = `${value}px`;
					}}
					onAfterChange={(value: SliderValue) => onPiece(value as number)}
					max={bgWidth}
					min={0}
					tipFormatter={null}
				/>
			</div>
		</div>
	);
};

Jigsaw.defaultProps = {
	onPiece: () => {}
};

export default memo(Jigsaw);
