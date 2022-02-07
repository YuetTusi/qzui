import { ipcRenderer } from 'electron';
import React, { Component, ErrorInfo } from 'react';
import Button from 'antd/lib/button';
import log from '@utils/log';
import { ErrorMessage } from './ErrorMessage';
import { Prop, State } from './prop';

/**
 * 错误捕获
 */
class ErrorBoundary extends Component<Prop, State> {
	constructor(props: Prop) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError(error: any) {
		return { hasError: true };
	}
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		log.error(`ErrorBoundary: ${error.message}, ErrorInfo: ${errorInfo.componentStack}`);
		this.setState({ err: error, errInfo: errorInfo });
	}
	render() {
		if (this.state.hasError) {
			//降级渲染
			return (
				<ErrorMessage title={this.state.err?.message!}>
					<div className="err-info-scrollbox">
						<ul>
							<li>消息：{this.state.err?.message ?? ''}</li>
							<li>StackInfo：{this.state.err?.stack ?? ''}</li>
						</ul>
					</div>
					<Button
						onClick={() => ipcRenderer.send('do-relaunch')}
						type="primary"
						icon="reload">
						重新启动
					</Button>
				</ErrorMessage>
			);
		} else {
			return this.props.children;
		}
	}
}

export default ErrorBoundary;
