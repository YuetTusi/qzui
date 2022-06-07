import React, { FC } from 'react';
import classnames from 'classnames';
import Layout from '@src/components/layout/Layout';
import { Route, NavLink } from 'dva/router';
import FetchLog from './FetchLog/FetchLog';
import ParseLog from './ParseLog/ParseLog';
import CloudLogView from './CloudLogView/CloudLogView';
import { helper } from '@utils/helper';
import './Index.less';

const { max, useServerCloud, fetchText, parseText } = helper.readConf();

/**
 * 操作日志布局页
 */
const Index: FC<{}> = () => (
	<Layout>
		<div className={classnames('operation-root', { pad: max <= 2 })}>
			<menu className={classnames('log-menu', { pad: max <= 2 })}>
				<ul>
					<li>
						<NavLink to="/operation" replace={true} exact={true} className="fetch">
							<div>
								{max <= 2 ? '' : <i title={`${fetchText ?? '采集'}日志`} />}
								<span>{fetchText ?? '采集'}日志</span>
							</div>
						</NavLink>
					</li>
					<li style={{ display: useServerCloud ? 'list-item' : 'none' }}>
						<NavLink to="/operation/cloud-log" replace={true} className="fetch">
							<div>
								{max <= 2 ? '' : <i title="云取日志" />}
								<span>云取日志</span>
							</div>
						</NavLink>
					</li>
					<li>
						<NavLink to="/operation/parse-log" replace={true} className="parse">
							<div>
								{max <= 2 ? '' : <i title={`${parseText ?? '解析'}日志`} />}
								<span>{parseText ?? '解析'}日志</span>
							</div>
						</NavLink>
					</li>
				</ul>
			</menu>
			<div className="operation-container">
				<Route path="/operation" exact={true} component={FetchLog} />
				<Route path="/operation/cloud-log" component={CloudLogView} />
				<Route path="/operation/parse-log" component={ParseLog} />
			</div>
		</div>
	</Layout>
);

export default Index;
