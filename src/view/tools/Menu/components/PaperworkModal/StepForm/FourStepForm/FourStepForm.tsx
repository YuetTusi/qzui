import { basename } from 'path';
import { debounce, uniqBy } from 'lodash';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Col, Row, Form, Icon, Input, Button, Tag, Tooltip, Empty } from 'antd';
import { helper } from '@src/utils/helper';
import { Attachment, StepFourFormValue } from './prop';
import noneImg from '../images/bsdMkMger8.jpg';
import './FourStepForm.less';

const { create, Item } = Form;
const { TextArea } = Input;

/**
 * 第4步表单
 */
const FourStepForm = create<StepFourFormValue>({
    name: 'stepFourForm',
    onValuesChange({ dispatch, paperworkModal }, values) {
        const next = { ...paperworkModal.fourFormValue, ...values };
        dispatch({ type: 'paperworkModal/setFourFormValue', payload: next });
    },
})(forwardRef<Form, StepFourFormValue>(
    ({ form, dispatch, paperworkModal, visible }) => {

        const { getFieldDecorator, setFieldsValue } = form;
        const { fourFormValue } = paperworkModal;
        const [loading, setLoading] = useState<boolean>(false);
        const maskRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const initValues = {
                checkStep: '',
                summary: '本次电子证据检查过程制作、生产的文件存放在附卷的光盘中。 \r\n至此检查过程结束。',
                attachments: [],
                reportCapture: ''
            };
            dispatch({
                type: 'paperworkModal/setFourFormValue', payload: initValues
            });
            setFieldsValue(initValues);
        }, []);

        /**
         * 选择图片/压缩包
         */
        const selectFileHandle = debounce(async (type: 'image' | 'file') => {

            const { filePaths }: OpenDialogReturnValue = await ipcRenderer
                .invoke('open-dialog', {
                    title: '请选择照片',
                    properties: type === 'image' ? ['openFile'] : ['multiSelections', 'openFile'],
                    filters: [{
                        name: type === 'image' ? '图片文件' : '压缩包',
                        extensions: type === 'image' ? ['jpg', 'jpeg', 'png'] : ['zip', '7z', 'rar']
                    }],
                    // defaultPath: type === 'image' ? picturesPath.current : documentsPath.current
                })

            if (filePaths && filePaths.length > 0) {
                switch (type) {
                    case 'file':
                        setLoading(true);
                        let prev = fourFormValue?.attachments ?? [];
                        let next: Attachment[] = [];

                        for (let i = 0; i < filePaths.length; i++) {
                            const [md5, sha1, sha256] = await Promise.all([
                                helper.hashFile(filePaths[i], 'md5'),
                                helper.hashFile(filePaths[i], 'sha1'),
                                helper.hashFile(filePaths[i], 'sha256')
                            ]);
                            next.push({
                                path: filePaths[i],
                                md5, sha1, sha256
                            });
                        }
                        dispatch({
                            type: 'paperworkModal/setFourFormValue', payload: {
                                ...fourFormValue,
                                attachments: uniqBy([...prev, ...next], 'path')
                            }
                        });
                        setLoading(false);
                        break;
                    case 'image':
                        dispatch({
                            type: 'paperworkModal/setFourFormValue', payload: {
                                ...fourFormValue,
                                reportCapture: filePaths[0]
                            }
                        });
                        break;
                }
            }
        }, 600, { leading: true, trailing: false });

        const onDrop = (attach: Attachment) => {
            const prev = fourFormValue?.attachments ?? [];
            const next = prev.filter((i: Attachment) => i.path !== attach.path);
            dispatch({
                type: 'paperworkModal/setFourFormValue', payload: {
                    ...fourFormValue,
                    attachments: next
                }
            });
        };

        /**
         * 渲染附件列表
         */
        const renderAttach = () => {
            const attaches: Attachment[] = fourFormValue?.attachments ?? [];
            return attaches.map((item, index) => <li
                key={`Attach_${index}`}>
                <Button
                    onClick={() => onDrop(item)}
                    data-path={item}
                    size="small"
                    type="danger"
                    title="删除"
                    icon="delete"
                    style={{ marginTop: '5px' }}>
                </Button>
                <div className="file-info">
                    <span className="file-name">{basename(item.path)}</span>
                    <span>
                        <Tooltip title={'MD5：' + item.md5}><Tag>MD5</Tag></Tooltip>
                        <Tooltip title={'SHA1：' + item.sha1}><Tag>SHA1</Tag></Tooltip>
                        <Tooltip title={'SHA256：' + item.sha256}><Tag>SHA256</Tag></Tooltip>
                    </span>
                </div>
            </li>);
        };

        return <div style={{ display: visible ? 'block' : 'none' }} className="four-step-form-box">
            <Form
                layout="vertical">
                <Item
                    label="检查步骤">
                    {getFieldDecorator('checkStep')(<TextArea rows={4} />)}
                </Item>
                <Item
                    label="结语">
                    {getFieldDecorator('summary')(<TextArea />)}
                </Item>
            </Form>
            <Row gutter={16}>
                <Col span={16}>
                    <fieldset className="sample-img">
                        <legend>
                            附件压缩包
                        </legend>
                        <div className="attaches">
                            {
                                fourFormValue?.attachments?.length === 0
                                    ?
                                    <div className="empty-box">
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="暂无附件" />
                                    </div>
                                    : <div className="attach-list-box">
                                        <ul>
                                            {renderAttach()}
                                        </ul>
                                    </div>
                            }
                            <Button
                                onClick={() => selectFileHandle('file')}
                                size="small"
                                type="primary"
                                icon="upload"
                                style={{ margin: '14px 0' }}>
                                <span>上传</span>
                            </Button>
                            <div
                                style={{ display: loading ? 'flex' : 'none' }}
                                ref={maskRef}
                                className="mask">
                                <Icon type="loading" />
                            </div>
                        </div>
                    </fieldset>
                </Col>
                <Col span={8}>
                    <fieldset className="sample-img">
                        <legend>
                            取证报告截图
                        </legend>
                        <div className="imgs">
                            <img
                                width={160}
                                height={160}
                                src={
                                    helper.isNullOrUndefinedOrEmptyString(fourFormValue.reportCapture)
                                        ? noneImg
                                        : fourFormValue.reportCapture
                                } />
                            <Button
                                onClick={() => selectFileHandle('image')}
                                size="small"
                                type="primary"
                                icon="upload"
                                style={{ margin: '14px 0' }}>
                                <span>上传</span>
                            </Button>
                        </div>
                    </fieldset>
                </Col>
            </Row>
        </div>
    }
));

export { FourStepForm };