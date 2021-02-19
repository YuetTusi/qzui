import path from 'path';
import React, { Component, MouseEvent } from 'react';
import Button, { ButtonProps } from 'antd/lib/button';
import { helper } from '@utils/helper';

const { max }: { max: number } = helper.readConf();
let countdownWorker: Worker;

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

/**
 * 倒计时按钮
 * @param initVal 初始秒数
 */
function countdownButton(initVal = 60) {
	return (AntdButton: typeof Button) => {
		return class CountdownButton extends Component<ButtonProps, { sec: number }> {
			constructor(props: ButtonProps) {
				super(props);
				/**
				 * 倒计时秒数
				 */
				this.state = {
					sec: 0
				};
			}
			
			start = () => {
				this.setState((prev) => ({ sec: prev.sec - 1 }));
				return this.state.sec !== 0;
			};
			render() {
				const { children } = this.props;
				const { sec } = this.state;
				return (
					<AntdButton
						{...this.props}
						disabled={sec !== 0}
						onClick={(event: MouseEvent<HTMLElement>) => {
							this.setState({ sec: initVal });
							this.props.onClick!(event);
						}}>
						{children}
						<span>{sec === 0 ? null : `（${sec}）`}</span>
					</AntdButton>
				);
			}
		};
	};
}


export { hiddenButton, withModeButton, countdownButton };
