import React, { forwardRef } from 'react';
import './Jigsaw.less';

interface Prop {
	/**
	 * 数据源
	 */
	src: string;
	/**
	 * 拼图宽
	 */
	width: number;
	/**
	 * 拼图高
	 */
	height: number;
}

/**
 * 图片缺块
 */
const Gap = forwardRef<HTMLImageElement, Prop>(({ src, height, width }, ref) => {
	return (
		<img
			ref={ref}
			src={src}
			width={width}
			height={height}
			className="gap-box"
		/>
	);
});

Gap.defaultProps = {
	width: 0,
	height: 0
};

export { Gap };
