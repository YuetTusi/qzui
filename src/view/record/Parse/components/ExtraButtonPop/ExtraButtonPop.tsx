import React, { FC } from 'react';
import Popover from 'antd/lib/popover';
import Buttons from './Buttons';
import { Prop } from './componentType';
import './ExtraButtonPop.less';

const ExtraButtonPop: FC<Prop> = (props) => {
	return (
		<Popover content={<Buttons {...props} />} trigger="click" placement="topLeft">
			<div className="extra-button-pop-root">{props.children}</div>
		</Popover>
	);
};

export default ExtraButtonPop;
