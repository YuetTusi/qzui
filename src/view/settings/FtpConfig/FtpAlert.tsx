import React, { FC } from 'react';
import Alert from 'antd/lib/alert';
import Icon from 'antd/lib/icon';

interface Prop {
	type: 'success' | 'info' | 'warning' | 'error' | 'loading' | 'hidden';
}

/**
 * FTP消息
 * @param props
 * @returns
 */
const FtpAlert: FC<Prop> = (props) => {
	const { type } = props;

	switch (type) {
		case 'success':
			return <Alert message="连接成功，请保存配置" type={type} showIcon={true} />;
		case 'info':
		case 'warning':
		case 'error':
			return <Alert message="失败，无法连接到指定FTP服务器" type={type} showIcon={true} />;
		case 'loading':
			return (
				<Alert
					message="正在测试FTP连接"
					type="info"
					icon={<Icon type="loading" />}
					showIcon={true}
				/>
			);
		case 'hidden':
			return (
				<Alert
					style={{ display: 'none' }}
					message="正在测试FTP连接"
					type="info"
					icon={<Icon type="loading" />}
					showIcon={true}
				/>
			);
	}
};

export default FtpAlert;
