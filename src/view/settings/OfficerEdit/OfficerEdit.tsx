import React, { FC, useRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Button from 'antd/lib/button';
import debounce from 'lodash/debounce';
import Title from '@src/components/title';
import { StateTree } from '@src/type/model';
import { withModeButton } from '@src/components/enhance';
import { Officer } from '@src/schema/Officer';
import EditForm from './EditForm';
import policeSvg from './images/police.svg';
import { Prop } from './componentTypes';
import './OfficerEdit.less';

const ModeButton = withModeButton()(Button);
/**
 * 采集人员新增/编辑
 * 路由参数是-1为新增操作
 */
const OfficeEdit: FC<Prop> = ({ dispatch, match, location }) => {
	const formRef = useRef<any>();

	/**
	 * 保存采集人员
	 */
	const saveOfficer = debounce(
		() => {
			const { validateFields } = formRef.current;
			let entity = new Officer();
			validateFields((err: Error, values: Officer) => {
				if (!err) {
					if (match.params.id == '-1') {
						//新增
						entity = { ...values };
					} else {
						//编辑
						entity = {
							...values,
							_id: match.params.id
						};
					}
					dispatch({ type: 'officerEdit/saveOfficer', payload: entity });
				}
			});
		},
		1200,
		{
			leading: true,
			trailing: false
		}
	);

	const render = () => {
		const params = new URLSearchParams(location.search);
		const name = params.get('name');
		const no = params.get('no');
		return (
			<div className="officer-edit">
				<Title
					returnText="返回"
					onReturn={() => dispatch(routerRedux.push('/settings/officer'))}>
					{match.params.id === '-1' ? '新增采集人员' : '编辑采集人员'}
				</Title>
				<div className="center-panel">
					<div className="input-area">
						<div className="avatar">
							<i>
								<img src={policeSvg} />
							</i>
						</div>
						<EditForm
							ref={formRef}
							id={match.params.id}
							data={new Officer({ name, no })}
						/>
						<div className="buttons">
							<ModeButton type="primary" icon="save" onClick={() => saveOfficer()}>
								确定
							</ModeButton>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return render();
};

export default connect((state: StateTree) => ({ state }))(OfficeEdit);
