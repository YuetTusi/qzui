import React, { FC } from 'react';
import { LogItem, LogListProp } from './componentTypes';

const LogList: FC<LogListProp> = (props) => {
	const { logs } = props;

	const renderLogs = (logs: [string, LogItem][]) => {
		return logs.map((log) => {
			return (
				<div>
					<h2>{log[0].replace(/\-/g, '.')}</h2>
					<div className="details">
						<div>
							<label>日期：</label>
							<span>{log[1].Date}</span>
						</div>
						<div className="spe">
							<label>ID：</label>
							<span>{log[1].ID}</span>
						</div>
					</div>
					<ul>
						{log[1].Item.map((item, index) => (
							<li key={`L_${index}`}>{item}</li>
						))}
					</ul>
				</div>
			);
		});
	};

	return <div className="version-log-list-root">{renderLogs(logs)}</div>;
};

export default LogList;
