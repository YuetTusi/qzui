import React, { MouseEvent, useEffect, useState } from "react";
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { HuaweiCloneModalProp } from "./prop";
import debounce from "lodash/debounce";
import { ipcRenderer, OpenDialogReturnValue } from "electron";
import Button from "antd/lib/button";
import { Icon } from "antd";
import './HuaweiCloneModal.less';

const { Item, create } = Form;

const HuaweiCloneModal = create<HuaweiCloneModalProp>({ name: 'huaweiCloneForm' })(({
    form,
    visible,
    onOk,
    onCancel
}: HuaweiCloneModalProp) => {

    const { validateFields, getFieldDecorator, setFieldsValue, resetFields } = form;

    const [defPath, setDefPath] = useState('');

    useEffect(() => {
        ipcRenderer
            .invoke('get-path', 'documents')
            .then(p => setDefPath(p));
    }, [visible]);

    /**
 * 云帐单保存目录Handle
 */
    const selectSaveHandle = debounce(
        (event: MouseEvent<HTMLInputElement>) => {
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

        validateFields((err, values) => {
            if (err) {
                console.warn(err);
            } else {
                onOk(values.targetPath);
                reset();
            }
        });
    };

    const reset = () => resetFields();


    return <Modal
        footer={[
            <Button onClick={() => {
                onCancel();
                reset();
            }} key="MCM_0" type="default">
                <Icon type="close-circle" />
                <span>取消</span>
            </Button>,
            <Button onClick={formSubmit} key="MCM_1" type="primary">
                <Icon type="check-circle" />
                <span>确定</span>
            </Button>
        ]}
        onCancel={onCancel}
        visible={visible}
        width={600}
        title="华为手机克隆"
        centered={true}
        maskClosable={false}
        destroyOnClose={true}
    >
        <div className="huawei-clone-modal-root">

            <fieldset className="tips">
                <legend>操作提示</legend>
                <div>
                    <ul>
                        <li>选择数据保存目录</li>
                        <li>请创建热点并用华为手机连接，名称形如<strong>TAS-AL00%8888%CloudClone</strong>（其中文字<strong>8888</strong>可自行定义）</li>
                    </ul>
                </div>
            </fieldset>
            <Form>
                <div style={{ marginTop: '10px' }}>
                    <Form>
                        <Item
                            label="保存目录"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}>
                            {getFieldDecorator('targetPath', {
                                rules: [
                                    { required: true, message: '请选保存目录' }
                                ],
                                initialValue: defPath
                            })(<Input
                                readOnly={true}
                                onClick={selectSaveHandle}
                            />)}
                        </Item>
                    </Form>
                </div>
            </Form>
        </div>
    </Modal>
});

export default HuaweiCloneModal;