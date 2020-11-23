import path from 'path';
import React, { FC, memo, useState } from 'react';
import { helper } from '@src/utils/helper';
import iconLogo from './images/icon.png';
import { useMount } from '@src/hooks';

interface Prop {}

const appPath = process.cwd();
const config = helper.readConf();
const logoPath =
	process.env.NODE_ENV === 'development'
		? iconLogo
		: path.join(appPath, `./resources/config/${config.logo}`);

/**
 * 2路底部Logo组件
 * @param props
 */
const BottomLogo: FC<Prop> = (props) => {
	const [appName, setAppName] = useState<string | null>(null);

	useMount(async () => {
		try {
			const manu = await helper.readManufaturer();
			setAppName(manu.materials_name ?? '');
		} catch (error) {
			setAppName('');
		}
	});

	return (
		<div className="bottom-logo">
			<img src={logoPath} width={140} height={140} className="logo-icon" alt="logo" />
			<div className="text">
				<div>{appName}</div>
			</div>
		</div>
	);
};

export default memo(BottomLogo);
