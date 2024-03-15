import debounce from 'lodash/debounce';
import { OpenDialogReturnValue, ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Radio from 'antd/lib/radio';
import Modal from 'antd/lib/modal';
import { ExportFullReportModalProp, ExportType } from './prop';

const { Group } = Radio;
const { Item, create } = Form;

const ExportFullReportModal = create<ExportFullReportModalProp>({ name: 'fullReport' })(({
    form, visible, data, onCancel, onOk
}: ExportFullReportModalProp) => {

    const {
        getFieldDecorator,
        setFieldsValue,
        resetFields,
        validateFields
    } = form;
    const [defaultPath, setDefaultPath] = useState<string>();

    useEffect(() => {
        if (visible) {
            (async () => {
                const doc = await ipcRenderer.invoke('get-path', 'documents');
                setDefaultPath(doc);
                setFieldsValue({ saveAt: doc });
            })();
        }
    }, [visible]);

    /**
     * 案件/检材选择
     * @param {boolean} isCase 是否是案件
     */
    const onSelectSaveAt = debounce(
        async () => {
            const { filePaths }: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
                title: '请选择存储目录',
                defaultPath,
                properties: ['openDirectory'],
            });

            if (filePaths.length > 0) {
                setFieldsValue({ saveAt: filePaths[0] });
            }
        },
        400,
        { leading: true, trailing: false }
    );

    /**
     * 提交
     */
    const onSubmit = () => {
        validateFields((err, values) => {
            if (err) {
                console.warn(err);
            } else {
                onOk(values, data);
            }
        });
    };

    /**
     * 取消Click
     */
    const onCancelClick = () => {
        resetFields();
        onCancel();
    };

    return <Modal
        footer={[
            <Button
                onClick={() => onCancelClick()}
                type="default"
                icon="close-circle"
                key="EFRM_0">
                <span>取消</span></Button>,
            <Button
                onClick={() => onSubmit()}
                type="primary"
                icon="check-circle"
                key="EFRM_1">
                <span>确定</span>
            </Button>
        ]}
        visible={visible}
        onCancel={onCancelClick}
        title="导出全量报告"
        centered={true}
        destroyOnClose={true}
        maskClosable={false}
        forceRender={true}
        getContainer="#root">
        <Form
            layout="vertical">
            <Item
                label="导出格式">
                {
                    getFieldDecorator('suffix', {
                        initialValue: ExportType.Word
                    })(
                        <Group>
                            <Radio value={ExportType.Word}>
                                <Icon type="file-word" style={{ color: '#2f5292' }} />
                                <span style={{ marginLeft: '4px' }}>Word</span>
                            </Radio>
                            <Radio value={ExportType.Excel}>
                                <Icon type="file-excel" style={{ color: '#247a49' }} />
                                <span style={{ marginLeft: '4px' }}>Excel</span>
                            </Radio>
                            <Radio value={ExportType.PDF}>
                                <Icon type="file-pdf" style={{ color: '#ea0001' }} />
                                <span style={{ marginLeft: '4px' }}>PDF</span>
                            </Radio>
                        </Group>
                    )
                }
            </Item>
            <Item label="存储位置">
                {
                    getFieldDecorator('saveAt', {
                        rules: [{ required: true, message: '请选择存储目录' }]
                    })(
                        <Input
                            onClick={() => onSelectSaveAt()}
                            readOnly={true}
                            suffix={<Icon type="dash" />} />)
                }

            </Item>
        </Form>
    </Modal>;
});

export { ExportFullReportModal };