import React, { Component } from 'react';
import log from '@utils/log';
import { ErrorMessage } from './ErrorMessage';

interface Prop {}
interface State {
	hasError: boolean;
}

class ErrorBoundary extends Component<Prop, State> {
	constructor(props: Prop) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: any) {
		// 更新 state 使下一次渲染能够显示降级后的 UI
		return { hasError: true };
	}

	componentDidCatch(error: any, errorInfo: any) {
		// 你同样可以将错误日志上报给服务器

		console.clear();
		console.log(error);
		console.log(errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// 你可以自定义降级后的 UI 并渲染
			return <ErrorMessage>Something went wrong.</ErrorMessage>;
		} else {
			return this.props.children;
		}
	}
}

export default ErrorBoundary;
