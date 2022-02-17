import React, { FC, memo } from 'react';
import { ProgressBarProp } from './prop';
import './ProgressBar.less';

/**
 * 进度动画条
 */
const ProgressBar: FC<ProgressBarProp> = ({ value }) => {
	return (
		<div className="progress-bar-loading">
			<div className="bar-bg">
				<div className="current-percent" style={{ width: `${value}%` }}>
					<label className="progress-bar-pvalue-label" htmlFor="current-percent">
						{value}%
					</label>
				</div>
			</div>
		</div>
	);
};

export default memo(ProgressBar);
