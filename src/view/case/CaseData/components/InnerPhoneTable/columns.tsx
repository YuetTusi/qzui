import { ipcRenderer } from 'electron';
import React from 'react';
import moment from 'moment';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { Prop } from './componentTyps';
import { TableName } from '@src/schema/db/TableName';
import { DataMode } from '@src/schema/DataMode';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import NoWrapText from '@src/components/NoWrapText/NoWrapText';

type SetDataHandle = (data: DeviceType[]) => void;
type SetLoadingHandle = (loading: boolean) => void;
const { devText, fetchText } = helper.readConf();

/**
 * 根据模式返回手机名称
 * @param mobileName 手机名称
 * @param mode 模式
 */
const getMobileNameByMode = (mobileName: string, mode: DataMode) => {
	switch (mode) {
		case DataMode.ServerCloud:
			return <span className="cloud-cell">{`${mobileName}(云取)`}</span>;
		default:
			return <span>{mobileName}</span>;
	}
};

/**
 * 表头定义
 * @param {Function} props.delHandle 删除Handle
 * @param {string} props.caseId 案件id
 */
function getColumns(
	props: Prop,
	setDataHandle: SetDataHandle,
	setLoadingHandle: SetLoadingHandle
): ColumnGroupProps[] {
	const columns = [
		{
			title: `${devText ?? '手机'}名称`,
			dataIndex: 'mobileName',
			key: 'mobileName',
			render(value: string, { mode }: DeviceType) {
				const [name] = value.split('_');
				return getMobileNameByMode(name, mode!);
			}
		},
		{
			title: `${devText ?? '手机'}持有人`,
			dataIndex: 'mobileHolder',
			key: 'mobileHolder',
			width: '150px'
		},
		{
			title: `${devText ?? '手机'}编号`,
			dataIndex: 'mobileNo',
			key: 'mobileNo',
			width: '150px'
		},
		{
			title: '备注',
			dataIndex: 'note',
			key: 'note',
			width: '150px',
			render(value: string) {
				return <NoWrapText width={130}>{value}</NoWrapText>;
			}
		},
		{
			title: `${fetchText ?? '取证'}时间`,
			dataIndex: 'fetchTime',
			key: 'fetchTime',
			width: '160px',
			align: 'center',
			sorter(m: DeviceType, n: DeviceType) {
				let isAfter = moment(m.fetchTime).isAfter(moment(n.fetchTime));
				return isAfter ? 1 : -1;
			},
			render(value: Date) {
				if (helper.isNullOrUndefined(value)) {
					return helper.EMPTY_STRING;
				} else {
					return moment(value).format('YYYY-MM-DD HH:mm:ss');
				}
			}
		},
		{
			title: '删除',
			key: 'del',
			width: 60,
			align: 'center',
			render: (record: DeviceType) => {
				return (
					<a
						onClick={() => {
							Modal.confirm({
								title: `删除「${record.mobileName?.split('_')[0]}」数据`,
								content: `确认删除该${fetchText ?? '取证'}数据吗？`,
								okText: '是',
								cancelText: '否',
								async onOk() {
									const modal = Modal.info({
										content: '正在删除，请不要关闭程序',
										okText: '确定',
										maskClosable: false,
										okButtonProps: { disabled: true, icon: 'loading' }
									});
									try {
										setLoadingHandle(true);
										let success = await helper.delDiskFile(record.phonePath!);
										if (success) {
											modal.update({
												content: '删除成功',
												okButtonProps: {
													disabled: false,
													icon: 'check-circle'
												}
											});
											//NOTE:磁盘文件删除成功后，更新数据库
											await Promise.all([
												ipcRenderer.invoke('db-remove', TableName.Device, {
													_id: record._id
												}),
												ipcRenderer.invoke(
													'db-remove',
													TableName.CreateBcpHistory,
													{ deviceId: record.id },
													true
												)
											]);
											let next: DeviceType[] = await ipcRenderer.invoke(
												'db-find',
												TableName.Device,
												{
													caseId: record.caseId
												}
											);
											setDataHandle(
												next.sort((m, n) =>
													moment(m.fetchTime).isBefore(n.fetchTime)
														? 1
														: -1
												)
											);
										} else {
											modal.update({
												title: '删除失败',
												content: '可能文件仍被占用，请稍后再试',
												okButtonProps: {
													disabled: false,
													icon: 'check-circle'
												}
											});
										}
										setTimeout(() => {
											modal.destroy();
										}, 1000);
									} catch (error) {
										console.log(
											`@view/CaseData/InnerPhoneTable/columns: ${error.message}`
										);
										modal.update({
											title: '删除失败',
											content: '可能文件仍被占用，请稍后再试',
											okButtonProps: { disabled: false, icon: 'check-circle' }
										});
										setTimeout(() => {
											modal.destroy();
										}, 1000);
									} finally {
										setLoadingHandle(false);
									}
								}
							});
						}}>
						删除
					</a>
				);
			}
		}
	];
	return columns;
}

export { getColumns };
