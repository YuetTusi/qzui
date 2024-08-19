import moment from 'moment';
import { throttle } from 'lodash';
import React, { forwardRef, useEffect, useState } from "react";
import { Col, Row, Button, DatePicker, Empty, Form, Input, Card } from "antd";
import locale from 'antd/es/date-picker/locale/zh_CN';
import { StandardModal } from '../../../StandardModal';
import { StepTwoForm } from "./prop";
import './TwoStepForm.less';

const { TextArea } = Input;
const { create, Item } = Form;

/**
 * 第2步表单
 */
const TwoStepForm = create<StepTwoForm>({
    name: 'stepTwoForm',
    onValuesChange: throttle(({ dispatch, paperworkModal }, values) => {
        const [propertyName] = Object.keys(values);
        let next = paperworkModal.twoFormValue;
        if (propertyName === 'checkFrom' || propertyName === 'checkTo') {
            next = { ...paperworkModal.twoFormValue, [propertyName]: values[propertyName].format('YYYY-MM-DD') };
        } else {
            next = { ...paperworkModal.twoFormValue, ...values };
        }
        dispatch({
            type: 'paperworkModal/setTwoFormValue', payload: next
        });
    }, 200, { leading: true, trailing: false })
})(forwardRef<Form, StepTwoForm>(
    ({ dispatch, form, paperworkModal, visible }) => {

        const { getFieldDecorator } = form;
        const { twoFormValue } = paperworkModal;
        const [standardModalOpen, setStandardModalOpen] = useState(false);

        useEffect(() => {
            form.setFieldsValue({
                checkFrom: moment().add(-1, 'day'),
                checkTo: moment()
            });
            dispatch({
                type: 'paperworkModal/setTwoFormValue', payload: {
                    delegation: '',
                    checkFrom: moment().add(-1, 'day').format('YYYY-MM-DD'),
                    checkTo: moment().format('YYYY-MM-DD'),
                    checker: '',
                    condition: '',
                    purpose: '',
                    standard: [],
                    equipment: '',
                }
            });
        }, []);

        useEffect(() => console.log(paperworkModal.twoFormValue), [paperworkModal.twoFormValue])

        const onStandardSelect = (values: string[]) => {
            dispatch({
                type: 'paperworkModal/setTwoFormValue', payload: {
                    ...twoFormValue,
                    standard: values
                }
            });
            setStandardModalOpen(false);
        };

        const onDrop = (value: string) => {
            const next = twoFormValue.standard.filter((i: string) => i !== value);
            dispatch({
                type: 'paperworkModal/setTwoFormValue', payload: {
                    ...twoFormValue,
                    standard: next
                }
            });
        };

        const renderStandard = () => {
            const s: string[] = twoFormValue?.standard ?? [];
            if (s.length === 0) {
                return <Empty
                    description="未选择方法"
                    image={Empty.PRESENTED_IMAGE_SIMPLE} />;
            } else {
                return (twoFormValue?.standard ?? []).map((item: any, index: number) => <p
                    key={`SS_${index}`}>
                    <Button
                        onClick={() => onDrop(item)}
                        size="small"
                        type="danger"
                        icon="delete"
                        title="删除">
                    </Button>
                    <span style={{ marginLeft: '10px' }}>{item}</span>
                </p>);
            }
        };

        return <div
            style={{ display: visible ? 'flex' : 'none' }}
            className="two-step-form-root">
            <Form
                layout="vertical"
                style={{ width: '100%' }}>
                <Item
                    label="委托信息">
                    {getFieldDecorator('delegation', {
                        initialValue: ''
                    })(<Input />)}
                </Item>
                <Row gutter={16}>
                    <Col span={4}>
                        <Item
                            label="检查时间 起">
                            {getFieldDecorator('checkFrom')(<DatePicker locale={locale} />)}
                        </Item>
                    </Col>
                    <Col span={4}>
                        <Item
                            label="检查时间 止">
                            {getFieldDecorator('checkTo')(<DatePicker locale={locale} />)}
                        </Item>
                    </Col>
                    <Col span={8}>
                        <Item
                            label="检查人">
                            {getFieldDecorator('checker', {
                                initialValue: ''
                            })(<Input />)}
                        </Item>
                    </Col>
                    <Col span={8}>
                        <Item
                            label="检查对象封存固定情况">
                            {getFieldDecorator('condition', {
                                initialValue: ''
                            })(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <Item
                    label="检查目的">
                    {getFieldDecorator('purpose', {
                        initialValue: ''
                    })(<TextArea />)}
                </Item>
                <Item
                    label={
                        <>
                            <span>检查依据方法</span>
                            <Button
                                onClick={() => setStandardModalOpen(true)}
                                type="primary"
                                icon="plus-circle"
                                size="small"
                                style={{ marginLeft: '10px' }}>
                                添加
                            </Button>
                        </>
                    }>
                    <Card
                        size="small"
                        className="standard-card">
                        {renderStandard()}
                    </Card>
                </Item>
                <Item
                    label="检查设备">
                    {getFieldDecorator('equipment')(<TextArea />)}
                </Item>
            </Form>
            <StandardModal
                open={standardModalOpen}
                onOk={onStandardSelect}
                defaultValue={twoFormValue.standard}
                onCancel={() => setStandardModalOpen(false)} />
        </div>;
    }
));

export { TwoStepForm };