import React, { MouseEvent } from 'react';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import { AllowCaseName } from '@src/utils/regex';
import { AddCategoryModalProp } from './componentTypes';

const { Item } = Form;

/**
 * 添加关键词分类框
 */
const AddCategoryModal = Form.create<AddCategoryModalProp>({ name: 'addForm' })(({
    visible,
    loading,
    form,
    saveHandle,
    cancelHandle
}: AddCategoryModalProp) => {

    const { getFieldDecorator } = form;

    /**
     * 保存Click
     */
    const onSaveClick = (e: MouseEvent<HTMLButtonElement>) => {
        const { validateFields } = form;
        e.preventDefault();

        validateFields((error: Error, values) => {
            if (error) {
                console.warn(error);
            } else {
                saveHandle(values.name);
            }
        });
    }

    return <Modal
        footer={[
            <Button
                onClick={() => cancelHandle()}
                type="default"
                icon="close-circle"
                key="ACM_0">取消</Button>,
            <Button
                onClick={onSaveClick}
                disabled={loading}
                type="primary"
                icon={loading ? 'loading' : 'save'}
                key="ACM_1">确定</Button>
        ]}
        visible={visible}
        onCancel={cancelHandle}
        title="添加关键词分类"
        maskClosable={false}
        destroyOnClose={true}
    >
        <Form>
            <Item label="关键词分类">
                {getFieldDecorator('name', {
                    rules: [{
                        required: true, message: '请输入关键词分类'
                    }, {
                        pattern: AllowCaseName, message: '不允许输入非法字符'
                    }],
                })(<Input placeholder="分类名称，如：涉借贷，涉诈骗" />)}
            </Item>
        </Form>
    </Modal>
});

AddCategoryModal.defaultProps = {
    visible: false,
    loading: false,
    saveHandle: () => { },
    cancelHandle: () => { }
};

export { AddCategoryModalProp };
export default AddCategoryModal;