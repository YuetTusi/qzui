import electron, { OpenDialogReturnValue } from 'electron';
import debounce from 'lodash/debounce';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import Table from 'antd/lib/table';
import Form from 'antd/lib/form';
import messageBox from 'antd/lib/message';
import { StateTree } from '@src/type/model';
import { Apk, Phone } from '@src/model/tools/ApkModal';
import ApkTip from './ApkTip';
import { ApkModalProp, FormValue } from './componentType';
import { helper } from '@src/utils/helper';
import './ApkModal.less';

const { ipcRenderer } = electron;
const { Item } = Form;
const { Option } = Select;

const ApkModal = Form.create<ApkModalProp>({ name: 'apkForm' })(({
    form, apkModal, visible, cancelHandle, dispatch
}: ApkModalProp) => {
    const { phone, apk, message } = apkModal;
    const { getFieldDecorator, setFieldsValue, resetFields, validateFields } = form;
    const currentPhone = useRef<Phone>();
    const currentApks = useRef<Apk[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<any[]>([]);

    useEffect(() => {

        if (visible) {
            ipcRenderer
                .invoke('get-path', 'documents')
                .then((p) => setFieldsValue({ 'saveTo': p }));
            dispatch({ type: 'apkModal/queryPhone' });
        }
    }, [visible]);

    /**
     * 提取当前活动apk Click
     * @param event 
     */
    // const onActiveExtractClick = (event: MouseEvent<HTMLButtonElement>) => {
    //     event.preventDefault();
    //     dispatch({ type: 'apkModal/activeExtract' });
    // };

    /**
    * 表单Submit
    */
    const formSubmit = async () => {
        messageBox.destroy();
        validateFields((err: Error, values: FormValue) => {
            if (helper.isNullOrUndefined(err)) {
                if (checkedKeys.length === 0) {
                    messageBox.warn('请勾选提取应用');
                } else {
                    dispatch({
                        type: 'apkModal/apkExtract',
                        payload: {
                            id: currentPhone.current?.id,
                            phone: values.phone,
                            apk: currentApks.current ?? [],
                            saveTo: values.saveTo
                        }
                    });
                }
            }
        });
    };

    /**
    * 关闭弹框
    */
    const closeHandle = () => {
        resetFields();
        currentPhone.current = undefined;
        currentApks.current = [];
        dispatch({ type: 'apkModal/clearMessage' });
        dispatch({ type: 'apkModal/setApk', payload: [] });
        dispatch({ type: 'apkModal/setPhone', payload: [] });
        cancelHandle();
    };

    const renderOptions = () => {
        return phone.map(({ name, value, id }, index) => <Option
            key={`Dev_${index}`}
            value={value}
            data-id={id}>
            {name}
        </Option>);
    };

    /**
     * 设备Change
     * @param value  
     */
    const onPhoneChange = (value: string, options: any) => {
        currentPhone.current = {
            id: options['data-id'],
            name: options['children'],
            value
        };
        dispatch({ type: 'apkModal/queryApk', payload: { id: value } });
    };

    /**
     * 选择目录
     */
    const selectDirHandle = debounce(
        () => {
            ipcRenderer
                .invoke('open-dialog', {
                    properties: ['openDirectory']
                })
                .then((val: OpenDialogReturnValue) => {
                    if (val.filePaths && val.filePaths.length > 0) {
                        setFieldsValue({ saveTo: val.filePaths[0] });
                    }
                });
        },
        600,
        { leading: true, trailing: false }
    );

    const renderMessage = () => {
        if (helper.isNullOrUndefined(message) || message.length === 0) {
            return <Empty description="暂无消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        } else {
            return <ul>
                {message.map((item, index) => <li key={`AMM_${index}`}>{item}</li>)}
            </ul>
        }
    };

    return <Modal
        footer={[
            <Button
                onClick={() => {
                    resetFields(['phone']);
                    dispatch({ type: 'apkModal/clearMessage' });
                    dispatch({ type: 'apkModal/setApk', payload: [] });
                    dispatch({ type: 'apkModal/setPhone', payload: [] });
                    dispatch({ type: 'apkModal/queryPhone' });
                }}
                type="default"
                key="APKM_1">
                <Icon type="sync" />
                <span>刷新设备</span>
            </Button>,
            // <Button
            //     onClick={onActiveExtractClick}
            //     type="primary"
            //     key="APKM_2">
            //     <AndroidOutlined />
            //     <span>提取当前apk</span>
            // </Button>,
            <Button
                onClick={() => {
                    formSubmit();
                }}
                type="primary"
                key="APKM_3">
                <Icon type="android" />
                <span>提取选择apk</span>
            </Button>
        ]}
        visible={visible}
        width={800}
        title="安卓apk提取"
        forceRender={true}
        destroyOnClose={true}
        maskClosable={false}
        onCancel={closeHandle}
        className="apk-modal-root">
        <div className="apk-cbox">
            <div className="left">
                <ApkTip />
            </div>
        </div>
        <Form layout="horizontal" style={{ marginTop: '24px' }}>
            <Item
                label="设备"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}>
                {
                    getFieldDecorator('phone', {
                        rules: [
                            { required: true, message: '请选择设备' }
                        ]
                    })(<Select
                        onChange={onPhoneChange}
                        placeholder="请选择设备"
                        notFoundContent={
                            <Empty
                                description="暂无设备"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        }>
                        {renderOptions()}
                    </Select>)
                }
            </Item>
            <Item
                label="存储位置"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}>
                {
                    getFieldDecorator('saveTo', {
                        rules: [
                            { required: true, message: '请选择存储位置' }
                        ]
                    })(
                        <Input
                            onClick={() => selectDirHandle()}
                            readOnly={true}
                            placeholder="请选择存储位置" />
                    )
                }
            </Item>
        </Form>
        <Table<Apk>
            columns={[
                {
                    title: 'apk包名',
                    dataIndex: 'name',
                    key: 'name'
                }, {
                    title: '应用名称',
                    dataIndex: 'value',
                    key: 'value',
                    width: 240,
                }
            ]}
            rowSelection={{
                type: 'checkbox',
                selectedRowKeys: checkedKeys,
                onChange: (keys, rows) => {
                    currentApks.current = rows;
                    setCheckedKeys(keys);
                }
            }}
            onRow={(record) => ({
                onClick(_) {
                    const has = checkedKeys.some(item => item === record.name);
                    if (has) {
                        setCheckedKeys(checkedKeys.filter(item => item !== record.name));
                    } else {
                        setCheckedKeys([...checkedKeys, record.name]);
                    }
                }
            })}
            dataSource={apk}
            pagination={false}
            scroll={{ y: 155 }}
            rowKey={(record) => record.name}
            locale={{ emptyText: <Empty description={`暂无数据`} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            size="small"
        />
        <div className="apk-msg">
            <div className="caption">消息</div>
            <div className="scroll-dev">{renderMessage()}</div>
        </div>
    </Modal>;
});

export default connect((state: StateTree) => ({ apkModal: state.apkModal }))(ApkModal);
