import debounce from 'lodash/debounce';
import React from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import Form from 'antd/lib/form';
import { StateTree } from '@src/type/model';
import { helper } from '@src/utils/helper';
import { AndroidSetModalProp, SetType } from './prop';
import "./AndroidSetModal.less";

const { Item, create } = Form;
const { Option } = Select;

/**
 * 安卓设备操作框
 */
const AndroidSetModal = create<AndroidSetModalProp>()(({
    form,
    visible,
    type,
    androidSetModal,
    dispatch,
    onCancel
}: AndroidSetModalProp) => {

    const { getFieldDecorator, validateFields } = form;
    const { dev, message } = androidSetModal;

    const queryDev = debounce(
        () => {
            dispatch({ type: 'androidSetModal/queryDev' });
        },
        500,
        { leading: true, trailing: false }
    );

    /**
    * 表单Submit
    */
    const formSubmit = () => {

        validateFields((error, values) => {
            if (error) {
                console.warn(error);
            } else {
                switch (type) {
                    case SetType.PickAuth:
                        dispatch({
                            type: 'androidSetModal/pick',
                            payload: { id: values.id }
                        });
                        break;
                    case SetType.Unlock:
                        dispatch({
                            type: 'androidSetModal/unlock',
                            payload: { id: values.id }
                        });
                        break;
                }
            }
        });
    };

    /**
    * 关闭弹框
    */
    const closeHandle = () => {
        dispatch({ type: 'androidSetModal/setDev', payload: [] });
        dispatch({ type: 'androidSetModal/closeAndroidAuth' });
        dispatch({ type: 'androidSetModal/clearMessage' });
        onCancel();
    };

    const renderOptions = () => {
        return dev.map(({ name, value }, index) => <Option key={`Dev_${index}`} value={value}>
            {name}
        </Option>);
    };

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
     * 渲染功能按钮
     * @returns 
     */
    const renderButton = () => {
        switch (type) {
            case SetType.PickAuth:
                return <Button
                    onClick={() => {
                        formSubmit();
                    }}
                    icon="key"
                    type="primary"
                    key="AAM_Pick">
                    <span>提权</span>
                </Button>;
            case SetType.Unlock:
                return <Button
                    onClick={() => {
                        formSubmit();
                    }}
                    icon="unlock"
                    type="primary"
                    key="AAM_Unlock">
                    <span>解锁</span>
                </Button>;
        }
    };

    return <Modal
        footer={
            <>
                <Button
                    onClick={() => {
                        dispatch({ type: 'androidSetModal/clearMessage' });
                        queryDev();
                    }}
                    icon="sync"
                    type="default"
                    key="AAM_0">
                    <span>刷新</span>
                </Button>
                {renderButton()}
            </>
        }
        onCancel={closeHandle}
        visible={visible}
        width={650}
        centered={true}
        destroyOnClose={true}
        maskClosable={false}
        getContainer="#root"
        title={type === SetType.PickAuth ? '安卓提权' : '安卓解锁'}>
        <div className="android-set-modal-root">
            <div className="auth-cbox">
                <fieldset className="tip-msg full">
                    <legend>
                        操作提示
                    </legend>
                    <ul>
                        <li>操作提示</li>
                    </ul>
                </fieldset>
            </div>
            <Form layout="horizontal" style={{ marginTop: '24px' }}>
                <Item
                    label="设备"
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}>
                    {
                        getFieldDecorator('id', {
                            rules: [
                                { required: true, message: '请选择设备' }
                            ]
                        })(<Select
                            placeholder="请选择设备"
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
            </Form>
            <div className="set-msg">
                <div className="caption">消息</div>
                <div className="scroll-dev">{renderMessage()}</div>
            </div>
        </div>
    </Modal>;
});

AndroidSetModal.defaultProps = {
    visible: false,
    type: SetType.PickAuth,
    onCancel: () => { }
};

export default connect(
    (state: StateTree) => ({
        androidSetModal: state.androidSetModal
    }))(AndroidSetModal);
