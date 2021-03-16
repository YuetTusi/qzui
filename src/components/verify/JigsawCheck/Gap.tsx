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
 * @param props
 * @returns
 */
const Gap = forwardRef<HTMLImageElement, Prop>((props, ref) => {
	return (
		<img
			ref={ref}
			src={props.src}
			width={props.width}
			height={props.height}
			className="gap-box"
		/>
	);
});

Gap.defaultProps = {
	width: 0,
	height: 0
};

export { Gap };
