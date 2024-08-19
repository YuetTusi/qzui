import debounce from 'lodash/debounce';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import React, { forwardRef, useEffect, useRef } from 'react';
import { Form, Input, Select, Col, Row, Tooltip, Icon, Empty } from 'antd';
import { helper } from '@src/utils/helper';
import { StepOneFormValue } from './prop';

const { create, Item } = Form;
const { Option } = Select;

/**
 * 第一步表单
 */
const OneStepForm = create<StepOneFormValue>({
    name: 'stepOneForm'
})(forwardRef<Form, StepOneFormValue>(
    ({ form, checkedDevices, selectedCaseName, visible }) => {

        const defaultDocPath = useRef<string>(helper.CWD);
        const { getFieldDecorator, setFieldsValue, resetFields } = form;

        useEffect(() => {
            ((async () => {
                const p = await ipcRenderer.invoke('get-path', 'documents');
                defaultDocPath.current = p;
                form.setFieldsValue({ savePath: p });
            }))();
        }, []);

        useEffect(() => {
            if (checkedDevices.length === 0) {
                resetFields(['mobileHolder']);
            }
        }, [checkedDevices]);

        useEffect(() => {
            setFieldsValue({ caseName: selectedCaseName });
        }, [selectedCaseName]);

        /**
         * 持有人Options
         */
        const bindOptions = () => {
            const options: JSX.Element[] = [];
            const holders = new Set<string>(checkedDevices.map((i: any) => i.mobileHolder!));
            for (let item of holders.values()) {
                options.push(<Option value={item} key={`Holder_${item}`}>{item}</Option>);
            }
            return options;
        };

        /**
         * 选择目录
         */
        const selectDirHandle = debounce(() => {
            ipcRenderer
                .invoke('open-dialog', {
                    title: '请选择存储目录',
                    properties: ['openDirectory'],
                    defaultPath: defaultDocPath.current
                })
                .then(({ filePaths }: OpenDialogReturnValue) => {
                    if (filePaths && filePaths.length > 0) {
                        setFieldsValue({ savePath: filePaths[0] });
                    }
                }).catch(() => {
                    setFieldsValue({ savePath: '' });
                });
        },
            600,
            { leading: true, trailing: false }
        );

        return <div style={{ display: visible ? 'block' : 'none', padding: '14px' }}>
            <Form style={{ width: '100%' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Item label="案件名称">
                            {getFieldDecorator('caseName', {
                                rules: [
                                    { required: true, message: '请填写案件名称' }
                                ]
                            })(<Input />)}

                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="案件编号">
                            {getFieldDecorator('caseNo', {
                                initialValue: ''
                            })(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Item label="报告名称">
                            {getFieldDecorator('reportName', {
                                rules: [
                                    { required: true, message: '请填写报告名称' }
                                ]
                            })(<Input />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="报告编号">
                            {getFieldDecorator('reportNo', {
                                initialValue: '（网监）勘[  ]    号'
                            })(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <Item label={
                    <span>
                        <span style={{ marginRight: '4px' }}>持有人</span>
                        <Tooltip title="请勾选检材数据">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                    </span>
                }>
                    {getFieldDecorator('mobileHolder', {
                        rules: [
                            { required: true, message: '请选择持有人' }
                        ]
                    })(
                        <Select
                            notFoundContent={<Empty
                                description="暂无持有人，请勾选检材数据"
                                image={Empty.PRESENTED_IMAGE_SIMPLE} />}>
                            {bindOptions()}
                        </Select>
                    )}
                </Item>
                <Item
                    label="保存路径">
                    {
                        getFieldDecorator('savePath', {
                            rules: [
                                { required: true, message: '请选择保存路径' }
                            ]
                        })(<Input onClick={selectDirHandle} readOnly={true} addonAfter="..." />)
                    }
                </Item>
            </Form>
        </div>
    }
));

export { OneStepForm };