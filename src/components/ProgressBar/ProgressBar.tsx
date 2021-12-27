import React, { FC } from 'react';
import './ProgressBar.less';

/**
 * 进度动画条
 */
const ProgressBar: FC<{}> = () => {
	return (
		<div className="progress-bar-loading">
			<span />
			<span />
			<span />
			<span />
			<span />
			<span />
			<span />
		</div>
	);
};

export default ProgressBar;
