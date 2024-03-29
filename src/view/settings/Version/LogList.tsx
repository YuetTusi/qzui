import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { LogItem, LogListProp } from './componentTypes';

const LogList: FC<LogListProp> = ({ logs }) => {
	const renderLogs = (logs: [string, LogItem][]) =>
		logs.map((log) => (
			<div>
				<h2>
					<FontAwesomeIcon icon={faListAlt} />
					<span>{log[0].replace(/\-/g, '.')}</span>
				</h2>
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
		));

	return <div className="version-log-list-root">{renderLogs(logs)}</div>;
};

export default LogList;
