import React, { FC, memo } from 'react';
import './Instruction.less';

interface Prop {}

/**
 * 文案说明
 */
const Instruction: FC<Prop> = ({ children }) => (
	<div className="instruction-widget">{children}</div>
);

export default memo(Instruction);
