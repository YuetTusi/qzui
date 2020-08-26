import React from 'react';
import moment from 'moment';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import { Prop } from './componentTyps';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import { LeftUnderline } from '@src/utils/regex';
import NoWrapText from '@src/components/NoWrapText/NoWrapText';
import { TableName } from '@src/schema/db/TableName';
import Db from '@src/utils/db';

type SetDataHandle = (data: DeviceType[]) => void;
type SetLoadingHandle = (loading: boolean) => void;

/**
 * 表头定义
 * @param {Function} props.delHandle 删除Handle
 * @param {string} props.caseId 案件id
 */
function getColumns({ caseId }: Prop,
    setDataHandle: SetDataHandle, setLoadingHandle: SetLoadingHandle): ColumnGroupProps[] {

    const columns = [{
        title: '手机名称',
        dataIndex: 'mobileName',
        key: 'mobileName',
        render(value: string) {
            if (value.match(LeftUnderline)) {
                return value.match(LeftUnderline)![0];
            } else {
                return value;
            }
        }
    }, {
        title: '手机持有人',
        dataIndex: 'mobileHolder',
        key: 'mobileHolder',
        width: '150px'
    }, {
        title: '手机编号',
        dataIndex: 'mobileNo',
        key: 'mobileNo',
        width: '150px'
    }, {
        title: '备注',
        dataIndex: 'note',
        key: 'note',
        width: '150px',
        render(value: string) {
            return <NoWrapText width={130}>{value}</NoWrapText>;
        }
    }, {
        title: '取证时间',
        dataIndex: 'fetchTime',
        key: 'fetchTime',
        width: '180px',
        align: 'center',
        sorter(m: DeviceType, n: DeviceType) {
            let isAfter = moment(m.fetchTime).isAfter(moment(n.fetchTime));
            return isAfter ? 1 : -1;
        },
        render(value: Date) {
            if (helper.isNullOrUndefined(value)) {
                return helper.EMPTY_STRING;
            } else {
                return moment(value).format('YYYY年M月D日 HH:mm:ss');
            }
        }
    }, {
        title: '删除',
        key: 'del',
        width: 100,
        align: 'center',
        render: (record: DeviceType) => {
            return <a onClick={() => {
                Modal.confirm({
                    title: `删除「${record.mobileName?.split('_')[0]}」数据`,
                    content: `确认删除该取证数据吗？`,
                    okText: '是',
                    cancelText: '否',
                    async onOk() {
                        const db = new Db<DeviceType>(TableName.Device);
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
                                modal.update({ content: '删除成功', okButtonProps: { disabled: false, icon: 'check-circle' } });
                                //NOTE:磁盘文件删除成功后，更新数据库
                                await db.remove({ _id: record._id });
                                let next: DeviceType[] = await db.find({ caseId: record.caseId });
                                setDataHandle(next.sort((m, n) => moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1));
                            } else {
                                modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                            }
                            setTimeout(() => {
                                modal.destroy();
                            }, 1000);
                        } catch (error) {
                            console.log(`@view/CaseData/InnerPhoneTable/columns: ${error.message}`);
                            modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                            setTimeout(() => {
                                modal.destroy();
                            }, 1000);
                        } finally {
                            setLoadingHandle(false);
                        }
                    }
                });
            }}>删除</a>;
        }
    }];
    return columns;
}

export { getColumns };