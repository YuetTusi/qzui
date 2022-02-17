import React, { FC, memo } from 'react';
import Progress from 'antd/lib/progress';
import { ProgressBarProp } from './prop';
import './ProgressBar.less';

/**
 * 进度动画条
 */
const ProgressBar: FC<ProgressBarProp> = ({ value }) => {
	return (
		<div className="progress-bar-loading">
			<Progress
				percent={value}
				status={value === 100 ? 'normal' : 'active'}
				showInfo={false}
				strokeLinecap="square"
				strokeColor="#416eb5"
			/>
		</div>
	);
};

export default memo(ProgressBar);
