import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './ErrorMessage.less';

interface Prop {
	title: string;
}

const ErrorMessage: FC<Prop> = ({ children, title }) => <div className="error-message-root">
	<div className="warn-bg">
		<div className="err-caption">{title ?? '取证程序暂时有些问题'}</div>
		<div className="err-message">
			<FontAwesomeIcon className="warn-icon" icon={faExclamationTriangle} />
			<div className="err-info-box">{children}</div>
		</div>
	</div>
</div>;

export { ErrorMessage };
