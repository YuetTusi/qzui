import React, { FC } from 'react';
import Spin from 'antd/lib/spin';
import './Mask.less';

interface Prop {
	show: boolean;
}

/**
 * 蒙层组件
 */
const Mask: FC<Prop> = ({ show }) => {
	return (
		<div className="mask-layer-root" style={{ display: show ? 'block' : 'none' }}>
			<Spin />
		</div>
	);
};

export default Mask;
