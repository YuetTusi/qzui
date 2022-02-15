import React, { FC } from 'react';
import Button from 'antd/lib/button';
import { ButtonListProp } from './prop';

const { Group } = Button;

const ButtonList: FC<ButtonListProp> = ({ buttonList, onSearch }) => (
	<Group>
		{buttonList.map(({ name, value, type }) => (
			<Button
				onClick={() => onSearch(value, type)}
				key={`Q_${value}`}
				icon="search"
				type="primary">
				{name}
			</Button>
		))}
	</Group>
);

ButtonList.defaultProps = {
	buttonList: [],
	onSearch: () => {}
};

export default ButtonList;
