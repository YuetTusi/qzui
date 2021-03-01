import React, { FC, memo } from 'react';
import './DataColor.less';

interface Prop {}

/**
 * 颜色说明
 * @param props
 */
const DataColor: FC<Prop> = (props) => {
	return (
		<div className="data-color-root">
			<div className="color">
				<span className="cloud"></span>
				<label>云取</label>
			</div>
		</div>
	);
};

export default memo(DataColor);
