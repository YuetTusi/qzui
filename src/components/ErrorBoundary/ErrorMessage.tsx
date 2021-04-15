import React, { FC } from 'react';
import './ErrorMessage.less';

interface Prop {}

const ErrorMessage: FC<Prop> = (props) => {
	return <div className="error-message-root">{props.children}</div>;
};

export { ErrorMessage };
