import React, { FC, useRef } from 'react';
import Slider, { SliderValue } from 'antd/lib/slider';
import { Gap } from './Gap';
import { Prop } from './componentType';
import './Jigsaw.less';

/**
 * 拼图验证
 * @param props
 * @returns
 */
const Jigsaw: FC<Prop> = (props) => {
	const { bgSrc, gapSrc, bgWidth, bgHeight, gapWidth, gapHeight, onPiece } = props;

	const gapRef = useRef<HTMLImageElement>(null);

	return (
		<div className="jigsaw-root">
			<div className="img-panel">
				<img src={bgSrc} width={bgWidth} height={bgHeight} className="bg"></img>
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
					max={400}
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

export default Jigsaw;
