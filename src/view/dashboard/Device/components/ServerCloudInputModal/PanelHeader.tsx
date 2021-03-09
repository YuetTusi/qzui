import React, { FC, MouseEvent } from 'react';
import Button from 'antd/lib/button';
import './PanelHeader.less';

interface Prop {
	/**
	 * 移动到按钮上Handle
	 */
	onResetButtonHover: (event: MouseEvent) => void;
	/**
	 * 还原Click
	 */
	onResetClick: (event: MouseEvent) => void;
}

const PanelHeader: FC<Prop> = (props) => {
	return (
		<div className="panel-header">
			<span>高级设置</span>
			<span>
				<Button
					onMouseEnter={props.onResetButtonHover}
					onClick={props.onResetClick}
					type="default"
					size="small"
					icon="undo">
					还原默认值
				</Button>
			</span>
		</div>
	);
};

export default PanelHeader;
