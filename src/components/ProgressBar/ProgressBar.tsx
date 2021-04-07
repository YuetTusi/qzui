import React, { FC } from 'react';
import './ProgressBar.less';

/**
 * 进度动画条
 * @param props
 */
const ProgressBar: FC<{}> = (props) => {
	return (
		<div className="progress-bar-loading">
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
		</div>
	);
};

export default ProgressBar;
