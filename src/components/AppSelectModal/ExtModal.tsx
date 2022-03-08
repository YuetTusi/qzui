
import React from 'react';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Form, { FormComponentProps } from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { CloudExt } from '@src/schema/AppConfig';

const { Item } = Form;

interface ExtModalProp extends FormComponentProps<{}> {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 应用id
     */
    appId: string,
    /**
     * 输入项
     */
    ext?: CloudExt[],
    /**
     * 确定handle
     */
    okHandle: (id: string, data: Record<string, string>) => void,
    /**
     * 取消handle
     */
    closeHandle: () => void,
}

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
};

const ExtModal = Form.create<ExtModalProp>({ name: 'ext-form' })(({
    visible, appId, ext, form, okHandle, closeHandle
}: ExtModalProp) => {

    const { getFieldDecorator, getFieldsValue } = form;

    const onSubmit = () => {
        const values = getFieldsValue();
        okHandle(appId, values);
    };

    const renderItems = () => {
        if (ext === undefined || ext.length === 0) {
            return null;
        }
        return ext.map(({ name, value, title }, index) => <Item
            label={title}
            key={`CEXT_${index}`}>
            {getFieldDecorator(name, { initialValue: value ?? '' })(<Input size="small" />)}
        </Item>);
    }

    return <Modal
        footer={[
            <Button onClick={() => {
                closeHandle()
            }} icon="close-circle" key="CEB_0" type="default">取消</Button>,
            <Button onClick={() => onSubmit()} icon="check-circle" key="CEB_1" type="primary">确定</Button>
        ]}
        onCancel={() => closeHandle()}
        visible={visible}
        zIndex={1002}
        centered={true}
        destroyOnClose={true}
        width={400}
        title={`参数设置`}
    >
        <Form {...formItemLayout}>
            {renderItems()}
        </Form>
    </Modal>
});

export default ExtModal;