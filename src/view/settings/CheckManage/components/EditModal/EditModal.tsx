import React from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { FetchData } from '@src/schema/socket/FetchData';
import { FormValue } from './fromValue';

interface Prop extends FormComponentProps {
    /**
     * 显示/隐藏
     */
    visible: boolean;
    /**
     * 数据
     */
    data: FetchData;
    /**
     * 保存handle
     */
    saveHandle: (data: FetchData) => void;
    /**
     * 取消handle
     */
    cancelHandle: () => void;
}

const { Item } = Form;

const getText = (txt?: string) => {
    if (txt) {
        return txt.split('_')[0];
    } else {
        return '';
    }
};

/**
 * 编辑弹框
 */
const EditModal = Form.create<Prop>({ name: 'editForm' })((props: Prop) => {
    const { data } = props;
    const { getFieldDecorator } = props.form;
    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 }
    };

    const formSubmit = () => {
        const { validateFields } = props.form;
        validateFields((err: Error, values: FormValue) => {
            if (!err) {
                let entity: FetchData = { ...data };
                entity.serial = data.serial;
                entity.mobileHolder = values.mobileHolder;
                entity.credential = values.credential;
                entity.mobileName = values.mobileName;
                entity.note = values.note;
                entity.mobileNo = values.mobileNo;
                props.saveHandle(entity);
            }
        });
    };

    return (
        <Modal
            visible={props.visible}
            title={`编辑-${data?.serial}`}
            onCancel={() => props.cancelHandle()}
            width={600}
            destroyOnClose={true}
            maskClosable={false}
            footer={[
                <Button onClick={() => props.cancelHandle()} icon="close-circle" type="default">
                    取消
                </Button>,
                <Button onClick={() => formSubmit()} icon="save" type="primary">
                    保存
                </Button>
            ]}
        >
            <div>
                <Form {...formItemLayout}>
                    <Item label="姓名">
                        {getFieldDecorator('mobileHolder', {
                            rules: [{ required: true, message: '请填写手机名称' }],
                            initialValue: data?.mobileHolder
                        })(<Input />)}
                    </Item>
                    <Item label="身份证/军官证号">
                        {getFieldDecorator('credential', {
                            rules: [{ required: true, message: '请填写身份证/军官证号' }],
                            initialValue: data?.credential
                        })(<Input />)}
                    </Item>
                    <Item label="手机名称">
                        {getFieldDecorator('mobileName', {
                            rules: [{ required: true, message: '请填写手机名称' }],
                            initialValue: getText(data?.mobileName)
                        })(<Input />)}
                    </Item>
                    <Item label="手机号">
                        {getFieldDecorator('note', {
                            rules: [{ required: true, message: '请填写手机号' }],
                            initialValue: data?.note
                        })(<Input />)}
                    </Item>
                    <Item label="手机编号">
                        {getFieldDecorator('mobileNo', {
                            initialValue: data?.mobileNo
                        })(<Input />)}
                    </Item>
                </Form>
            </div>
        </Modal>
    );
});

export default EditModal;
