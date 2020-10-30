import React, { FC } from 'react';

interface Prop {
	/**
	 * 完成消息
	 */
	fileName: string;
	/**
	 * 保存目录
	 */
	savePath: string;
	/**
	 * 打开目录handle
	 */
	openHandle: (savePath: string) => void;
}

const CompleteMsg: FC<Prop> = (props) => {
	return (
		<div className="complete-msg-root">
			「<em>{props.fileName}</em>」已保存至目录「
			<a onClick={() => props.openHandle(props.savePath)}>{props.savePath}</a>」
		</div>
	);
};

CompleteMsg.defaultProps = {
	fileName: 'report',
	savePath: '',
	openHandle: () => {}
};

export default CompleteMsg;
