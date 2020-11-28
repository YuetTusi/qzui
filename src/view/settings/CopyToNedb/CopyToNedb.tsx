import { remote } from 'electron';
import React from 'react';
import differenceWith from 'lodash/differenceWith';
import Form, { FormComponentProps } from 'antd/lib/form';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { TableName } from '@src/schema/db/TableName';
import Db from '@utils/db';
import Title from '@src/components/title/Title';
import { BaseEntity, DbInstance } from '@src/type/model';
import './CopyToNedb.less';

interface Prop extends FormComponentProps {}

const { Item } = Form;
const { Option } = Select;
const getDb = remote.getGlobal('getDb');

/**
 * 拷贝IndexedDB到Nedb
 * @param props
 */
const CopyToNedb = Form.create<Prop>()((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	const copyHandle = () => {
		validateFields((err, values: { tableName: TableName }) => {
			if (!err) {
				const { tableName } = values;
				const indexedDb = new Db<BaseEntity>(tableName);
				const nedb: DbInstance = getDb(tableName);
				Modal.confirm({
					title: `拷贝${tableName}表数据`,
					content: '相同_id的记录会失败，确认拷贝？',
					async onOk() {
						try {
							const [from, to] = await Promise.all([indexedDb.all(), nedb.all()]);
							const diff = differenceWith(from, to, (a, b) => a._id === b._id);
							console.log(diff);
							nedb.insert(diff);
							message.success('拷贝成功');
						} catch (error) {
							message.success(`拷贝失败：${error.message}`);
						}
					},
					okText: '是',
					cancelText: '否'
				});
			}
		});
	};

	return (
		<div>
			<Title okText="拷贝" onOk={copyHandle}>
				拷贝数据
			</Title>
			<div className="form-box">
				<Form layout="vertical">
					<Item label="表">
						{getFieldDecorator('tableName', {
							rules: [{ required: true, message: '请选择表' }]
						})(
							<Select>
								<Option value={TableName.Case} key={'Opt_1'}>
									案件表
								</Option>
								<Option value={TableName.Device} key={'Opt_2'}>
									设备表
								</Option>
								<Option value={TableName.FetchLog} key={'Opt_3'}>
									采集日志表
								</Option>
								<Option value={TableName.ParseLog} key={'Opt_4'}>
									解析日志表
								</Option>
								<Option value={TableName.Officer} key={'Opt_5'}>
									采集人员表
								</Option>
								<Option value={TableName.FtpConfig} key={'Opt_6'}>
									FTP配置表
								</Option>
							</Select>
						)}
					</Item>
				</Form>
			</div>
		</div>
	);
});

export default CopyToNedb;
