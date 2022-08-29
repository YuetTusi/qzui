import debounce from 'lodash/debounce';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import React, { MouseEvent } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { MiChangeModalProp } from './prop';
import './MiChangeModal.less';

const { Item } = Form;
const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 }
};

const MiChangeModal = Form.create<MiChangeModalProp>()(({ visible, form, onOk, onCancel }: MiChangeModalProp) => {

    const { getFieldDecorator, validateFields } = form;

    /**
     * 云帐单保存目录Handle
     */
    const selectSaveHandle = debounce(
        (event: MouseEvent<HTMLInputElement>) => {
            const { setFieldsValue } = form;
            ipcRenderer
                .invoke('open-dialog', {
                    properties: ['openDirectory']
                })
                .then((val: OpenDialogReturnValue) => {
                    if (val.filePaths && val.filePaths.length > 0) {
                        setFieldsValue({ targetPath: val.filePaths[0] });
                    }
                });
        },
        500,
        { leading: true, trailing: false }
    );

    const formSubmit = (event: MouseEvent<HTMLButtonElement>) => {
        validateFields((err: any, values: { targetPath: string }) => {
            if (!err) {
                onOk(values.targetPath);
            }
        });
    };

    return <Modal
        footer={[
            <Button onClick={() => onCancel()} type="default" icon="close-circle">
                取消
            </Button>,
            <Button onClick={formSubmit} type="primary" icon="check-circle">
                确定
            </Button>
        ]}
        onCancel={onCancel}
        visible={visible}
        title="小米换机采集"
        centered={true}
        maskClosable={false}
        destroyOnClose={true}
        className="mi-change-modal-root"
    >
        <fieldset className="tip-msg">
            <legend>小米换机采集提示</legend>
            <ul>
                <li>选择数据保存目录</li>
                <li>使用小米手机连接热点：<strong>abco_apbc5G_MI</strong></li>
                <li>打开小米换机，点击<strong>旧手机</strong>，选择热点<strong>abco_apbc5G_MI</strong>开始采集</li>
            </ul>
        </fieldset>
        <div className="form-box">
            <Form {...formItemLayout}>
                <Item label="保存目录" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                    {getFieldDecorator('targetPath', {
                        rules: [
                            {
                                required: true,
                                message: '请选保存目录'
                            }
                        ]
                    })(
                        <Input
                            addonAfter={<Icon type="ellipsis" onClick={selectSaveHandle} />}
                            readOnly={true}
                            onClick={selectSaveHandle}
                        />
                    )}
                </Item>
            </Form>
        </div>
    </Modal>
});

export default MiChangeModal;