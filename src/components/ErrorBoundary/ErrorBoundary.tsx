import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import Button from 'antd/lib/button';
import log from '@utils/log';
import { ErrorMessage } from './ErrorMessage';

interface State {
	hasError: boolean;
	err?: Error;
	errInfo?: any;
}

class ErrorBoundary extends Component<{}, State> {
	constructor(props: {}) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: any) {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		log.error(`ErrorBoundary: ${error.message}`);
		log.error(`ErrorComponent: ${JSON.stringify(errorInfo)}`);

		this.setState({ err: error, errInfo: errorInfo });
	}

	render() {
		if (this.state.hasError) {
			// 你可以自定义降级后的 UI 并渲染
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
