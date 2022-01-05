import React, { FC } from 'react';
import Button from 'antd/lib/button';
import { withModeButton } from '../enhance';
import { TitleProp } from './prop';
import './Title.less';

const ModeButton = withModeButton()(Button);

/**
 * 标题栏
 */
const Title: FC<TitleProp> = ({
	children,
	okText,
	okButtonProps,
	returnButtonProps,
	returnText,
	onOk,
	onReturn
}) => (
	<div className="title-bar">
		<span className="back">
			{returnText ? (
				<ModeButton type="primary" onClick={onReturn} icon={returnButtonProps?.icon}>
					{returnText}
				</ModeButton>
			) : (
				''
			)}
		</span>
		<span className="center-text">{children}</span>
		<span className="btn">
			{okText ? (
				<ModeButton
					type="primary"
					onClick={onOk}
					icon={okButtonProps?.icon}
					disabled={okButtonProps?.disabled}>
					{okText}
				</ModeButton>
			) : (
				''
			)}
		</span>
	</div>
);

export default Title;
