import React, { forwardRef, memo } from 'react';
import throttle from 'lodash/throttle';
import Form, { FormComponentProps } from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Officer from '@src/schema/Officer';
import { TableName } from '@src/schema/db/TableName';
import Db from '@utils/db';
import { PoliceNo } from '@utils/regex';

interface Prop extends FormComponentProps {
    /**
     * 数据
     */
    data: Officer;
    /**
     * 记录id
     */
    id?: string;
};

const { Item } = Form;

const EditForm = Form.create<Prop>({ name: 'officerForm' })(
    forwardRef<Form, Prop>(props => {

        const { data } = props;
        const { getFieldDecorator } = props.form;

        /**
         * 校验编号重复
         */
        const isExistNo = throttle(async (rule: any, value: string, callback: any) => {
            const db = new Db<Officer>(TableName.Officer);
            try {
                let data: Officer[] = await db.find({ no: value });
                if (props.id != '-1') {
                    data = data.filter(i => i._id !== props.id);
                }
                if (data.length !== 0) {
                    callback(new Error('编号已存在'));
                } else {
                    callback();
                }
            } catch (error) {
                callback();
            }
        }, 400);

        return <Form style={{ width: "340px", height: '200px' }}>
            <Item label="姓名">
                {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请填写姓名' }],
                    initialValue: data.name
                })(<Input prefix={<Icon type="user" />} maxLength={20} />)}
            </Item>
            <Item label="编号">
                {getFieldDecorator('no', {
                    rules: [
                        { required: true, message: '请填写编号' },
                        { pattern: PoliceNo, message: '6位数字' },
                        { validator: isExistNo, message: '编号已存在' }
                    ],
                    initialValue: data.no
                })(<Input placeholder="6位数字" prefix={<Icon type="idcard" />} />)}
            </Item>
        </Form>;
    })
);

export default memo(EditForm);
