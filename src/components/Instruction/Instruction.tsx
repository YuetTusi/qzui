import React, { FC, memo } from 'react';
import './Instruction.less';

interface Prop {}

/**
 * 文案说明
 */
const Instruction: FC<Prop> = (props) => <div className="instruction-widget">{props.children}</div>;

export default memo(Instruction);
