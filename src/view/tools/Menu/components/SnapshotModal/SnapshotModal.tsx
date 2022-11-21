import debounce from 'lodash/debounce';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { SnapshotModalProp } from './prop';
import { CrackTypes } from '@src/schema/CrackTypes';
import { helper } from '@src/utils/helper';
import { StateTree } from '@src/type/model';
import withModeButton from '@src/components/enhance';
import './SnapshotModal.less';

const { Item, create } = Form;
const { Option } = Select;
const ModeButton = withModeButton()(Button);

/**
 * 截屏窗口
 */
const SnapshotModal = create<SnapshotModalProp>({ name: 'snapshotForm' })(({
    visible,
    form,
    crackModal,
    dispatch,
    cancelHandle
}: SnapshotModalProp) => {

    const { dev, message } = crackModal!;
    const [defPath, setDefPath] = useState('');

    useEffect(() => {
        ipcRenderer
            .invoke('get-path', 'documents')
            .then(p => setDefPath(p));
    }, [visible]);

    const queryDev = debounce(
        () => {
            dispatch({ type: 'crackModal/queryDev' });
        },
        500,
        { leading: true, trailing: false }
    );

    /**
    * 表单Submit
    */
    const formSubmit = async () => {
        const { validateFields } = form;
        validateFields((err, { id, saveTo }) => {
            if (err) {
                console.warn(err);
            } else {
                console.log(id, saveTo);
                dispatch({
                    type: 'crackModal/snapshot',
                    payload: {
                        id,
                        saveTo,
                        type: CrackTypes.Snapshot
                    }
                });
            }
        });
    };

    /**
    * 关闭弹框
    */
    const closeHandle = () => {
        dispatch({ type: 'crackModal/setDev', payload: [] });
        dispatch({ type: 'crackModal/closeCrack' });
        dispatch({ type: 'crackModal/clearMessage' });
        cancelHandle();
    };

    const renderOptions = () =>
        dev.map(({ name, value }, index) =>
            <Option key={`Dev_${index}`} value={value}>
                {name}
            </Option>);

    const renderMessage = () => {
        if (helper.isNullOrUndefined(message) || message.length === 0) {
            return <Empty description="暂无消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        } else {
            return <ul>
                {message.map((item, index) => <li key={`M_${index}`}>{item}</li>)}
            </ul>
        }
    };

    /**
     * 保存目录Handle
     */
    const selectSaveHandle = debounce(
        (event: MouseEvent<HTMLInputElement>) => {
            event.preventDefault();
            const { setFieldsValue } = form;
            ipcRenderer
                .invoke('open-dialog', {
                    properties: ['openDirectory']
                })
                .then((val: OpenDialogReturnValue) => {
                    if (val.filePaths && val.filePaths.length > 0) {
                        setFieldsValue({ saveTo: val.filePaths[0] });
                    }
                });
        },
        500,
        { leading: true, trailing: false }
    );

    return <Modal
        footer={[
            <ModeButton
                onClick={() => {
                    dispatch({ type: 'crackModal/clearMessage' });
                    queryDev();
                }}
                icon="sync"
                type="default"
                key="CM_0">
                <span>刷新</span>
            </ModeButton>,
            <ModeButton
                onClick={() => {
                    dispatch({ type: 'crackModal/clearMessage' });
                    formSubmit();
                }}
                icon="camera"
                type="primary"
                key="CM_1">
                <span>截屏获取</span>
            </ModeButton>
        ]}
        visible={visible}
        width={850}
        centered={true}
        title="截屏获取"
        destroyOnClose={true}
        maskClosable={false}
        onCancel={closeHandle}>
        <div className="snapshot-modal-root">
            <fieldset className="tip-msg full">
                <legend>
                    操作提示
                </legend>
                <div>
                    <ul>
                        <li>
                            请将截屏设备插入USB接口
                        </li>
                        <li>
                            选择截屏设备及保存目录，若无设备请进行刷新，点击按钮截取
                        </li>
                        <li>
                            <strong>若为苹果设备，请在手机「设置→隐私和安全性→开发者模式」中手动打开开发者模式，并重启手机，点击打开开发者模式，重新截屏</strong>
                        </li>
                    </ul>
                </div>
            </fieldset>
            <Form layout="horizontal" style={{ marginTop: '24px' }}>
                <Item
                    label="截屏设备"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}>
                    {
                        form.getFieldDecorator('id', {
                            rules: [{ required: true, message: '请选择截屏设备' }]
                        })(<Select
                            placeholder="请选择截屏设备"
                            notFoundContent={
                                <Empty
                                    description="暂无设备"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            }>
                            {renderOptions()}
                        </Select>)

                    }
                </Item>
                <Item
                    label="保存目录"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}>
                    {
                        form.getFieldDecorator('saveTo', {
                            rules: [{ required: true, message: '请选保存目录' }],
                            initialValue: defPath
                        })(<Input
                            readOnly={true}
                            onClick={selectSaveHandle}
                        />)
                    }

                </Item>
            </Form>
            <div className="cut-msg">
                <div className="caption">消息</div>
                <div className="scroll-dev">{renderMessage()}</div>
            </div>
        </div>
    </Modal>;
});

export default connect((state: StateTree) => ({ crackModal: state.crackModal }))(SnapshotModal);
