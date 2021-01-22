import React, { Component } from 'react';
import Button, { ButtonProps } from 'antd/lib/button';
import { helper } from '@utils/helper';

const { max }: { max: number } = helper.readConf();

/**
 * 模式按钮，可按采集路数调整大小
 * @param deviceCount 设备数量，不传默认读取配置文件
 */
function withModeButton(deviceCount: number = max) {
	return function (AntdButton: typeof Button) {
		return class ExtendButton extends Component<ButtonProps> {
			render() {
				if (this.props.size === undefined) {
					return (
						<AntdButton {...this.props} size={deviceCount <= 2 ? 'large' : 'default'}>
							{this.props.children}
						</AntdButton>
					);
				} else {
					return <AntdButton {...this.props}>{this.props.children}</AntdButton>;
				}
			}
		};
	};
}

/**
 * 条件隐藏按钮，根据参数来隐藏/显示
 * @param {boolean} hidden 是否隐藏
 * @param {boolean} useNull 隐藏是否使用null值
 */
function hiddenButton(hidden: boolean, useNull: boolean = true) {
	return function (AntdButton: typeof Button) {
		return class ExtendButton extends Component<ButtonProps> {
			render() {
				if (hidden) {
					return useNull ? null : (
						<AntdButton style={{ display: 'none' }} {...this.props}>
							{this.props.children}
						</AntdButton>
					);
				} else {
					return <AntdButton {...this.props}>{this.props.children}</AntdButton>;
				}
			}
		};
	};
}

export { hiddenButton, withModeButton };
