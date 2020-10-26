import React, { useCallback, useRef, MouseEvent } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import Table from 'antd/lib/table';
import { useMount } from '@src/hooks';
import FetchData from '@src/schema/socket/FetchData';
import CheckForm from './components/CheckForm/CheckForm';
import EditModal from './components/EditModal/EditModal';
import { getColumns } from './columns';
import { Prop } from './componentType';
import './CheckManage.less';

/**
 * 点验设置
 * 与警综设置互斥（若开启点验，则自动关闭警综）
 */
const CheckManage = Form.create({ name: 'checkForm' })((props: Prop) => {
    const inputRef = useRef<any>();
    const { dispatch } = props;

    useMount(() => {
        dispatch({
            type: 'checkManage/queryCheckData',
            payload: {
                condition: {},
                current: 1
            }
        });
    });

    /**
     * 换页Change
     * @param dispatch 派发方法
     * @param current 当前页
     * @param pageSize 页尺寸
     */
    const pageChange = (current: number, pageSize?: number) => {
        let mobileHolder = inputRef.current.state.value;
        let condition: Record<string, any> = {};
        if (mobileHolder) {
            condition.mobileHolder = mobileHolder;
        }
        dispatch({
            type: 'checkManage/queryCheckData',
            payload: {
                condition,
                current,
                pageSize
            }
        });
    };

    /**
     * 查询Click
     */
    const searchClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        let mobileHolder = inputRef.current.state.value;
        dispatch({
            type: 'checkManage/queryCheckData',
            payload: {
                condition: { mobileHolder },
                current: 1
            }
        });
    }, []);

    /**
     * 清除Click
     */
    const clearClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        Modal.confirm({
            title: '清除全部数据',
            content: '清除数据不可恢复，确定吗？',
            okText: '是',
            cancelText: '否',
            onOk() {
                dispatch({ type: 'checkManage/clearCheckData' });
            }
        });
    }, []);

    return (
        <div className="check-manage-root">
            <div className="action-bar">
                <div className="form-box">
                    <CheckForm />
                </div>
                <div className="search-box">
                    <label>姓名：</label>
                    <Input ref={inputRef} />
                    <Button onClick={searchClick} type="primary" icon="search">
                        查询
                    </Button>
                    <Button onClick={clearClick} type="danger" icon="delete">
                        全部清除
                    </Button>
                </div>
            </div>
            <div className="content-box">
                <Table
                    columns={getColumns(dispatch)}
                    dataSource={props.checkManage.data}
                    loading={props.checkManage.loading}
                    pagination={{
                        current: props.checkManage.current,
                        pageSize: props.checkManage.pageSize,
                        total: props.checkManage.total,
                        onChange: pageChange
                    }}
                    locale={{
                        emptyText: (
                            <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )
                    }}
                    bordered={true}
                    size="middle"
                ></Table>
            </div>
            <EditModal
                visible={props.checkManage.editEntity !== null}
                data={props.checkManage.editEntity!}
                saveHandle={(data: FetchData) => {
                    dispatch({ type: 'checkManage/updateCheckData', payload: data });
                }}
                cancelHandle={() => dispatch({ type: 'checkManage/setEditEnitity', payload: null })}
            />
        </div>
    );
});

export default connect((state: any) => ({ checkManage: state.checkManage }))(CheckManage);
