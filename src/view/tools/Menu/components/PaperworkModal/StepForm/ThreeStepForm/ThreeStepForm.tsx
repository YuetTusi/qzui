import { debounce } from 'lodash';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import React, { forwardRef, useEffect, useState } from 'react';
import { Col, Row, Form, Input, Button } from 'antd';
import { helper } from '@src/utils/helper';
import DeviceType from '@src/schema/socket/DeviceType';
import { DeviceList } from '../DeviceList';
import { StepThreeFormValue } from './prop';
import noneImg from '../images/bsdMkMger8.jpg';
import './ThreeStepForm.less';

const { create, Item } = Form;
let thisId: string = '';

/**
 * 第3步表单
 */
const ThreeStepForm = create<StepThreeFormValue>({
    name: 'stepThreeForm',
    onValuesChange({ dispatch, paperworkModal }, values, allValues) {
        const next = paperworkModal.threeFormValue.map((i) => {
            if (i._id === thisId) {
                return { ...i, ...values };
            } else {
                return i;
            }
        });
        dispatch({ type: 'paperworkModal/setThreeFormValue', payload: next });
    },
})(forwardRef<Form, StepThreeFormValue>(
    ({ form, dispatch, paperworkModal, visible }) => {

        const { getFieldDecorator, setFieldsValue } = form;
        const [currentDev, setCurrentDev] = useState<DeviceType>(); //当前正在编辑的设备
        const [front, setFront] = useState<string>(''); //正面照片路径
        const [back, setBack] = useState<string>(''); //背面照片路径

        useEffect(() => {
            if (paperworkModal.checkedDevices.length > 0) {
                const [first] = paperworkModal.checkedDevices;
                thisId = first._id!;
                setFieldsValue({ ...first, mobileName: helper.getNameWithoutTime(first.mobileName ?? '') });
                setCurrentDev(first);
            }
        }, [paperworkModal.checkedDevices]);

        /**
         * 选择图片
         */
        const selectImageHandle = debounce((type: 'front' | 'back') => {
            ipcRenderer
                .invoke('open-dialog', {
                    title: '请选择照片',
                    properties: ['openFile'],
                    filters: [{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png'] }]
                })
                .then(({ filePaths }: OpenDialogReturnValue) => {
                    if (filePaths && filePaths.length > 0) {
                        switch (type) {
                            case 'back':
                                setBack(filePaths[0]);
                                dispatch({
                                    type: 'paperworkModal/setThreeFormValue',
                                    payload: paperworkModal.threeFormValue.map(i => {
                                        if (i._id === currentDev?._id) {
                                            return { ...i, backPath: filePaths[0] };
                                        } else {
                                            return i;
                                        }
                                    })
                                });
                                break;
                            case 'front':
                                setFront(filePaths[0]);
                                dispatch({
                                    type: 'paperworkModal/setThreeFormValue',
                                    payload: paperworkModal.threeFormValue.map(i => {
                                        if (i._id === currentDev?._id) {
                                            return { ...i, frontPath: filePaths[0] };
                                        } else {
                                            return i;
                                        }
                                    })
                                });
                                break;
                        }
                    }
                }).catch(() => {
                    setFieldsValue({ savePath: '' });
                });
        }, 600, { leading: true, trailing: false });

        const onDeviceClick = (id: string) => {
            thisId = id;
            const current = paperworkModal.threeFormValue.find(i => i._id === id);
            if (current) {
                setFieldsValue(current);
                setBack(current.backPath);
                setFront(current.frontPath);
                setCurrentDev(current);
            }
        };

        return <div className="three-step-form-root" style={{ display: visible ? 'flex' : 'none' }}>
            <div className="dev-box">
                <DeviceList
                    data={paperworkModal.checkedDevices}
                    onClick={onDeviceClick} />
            </div>
            <div className="form-three-box">
                <Form
                    layout="vertical">
                    <Item
                        label="检材名称">
                        {getFieldDecorator('mobileName', {
                            initialValue: ''
                        })(<Input />)}
                    </Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item
                                label="检材型号">
                                {getFieldDecorator('model', {
                                    initialValue: ''
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="持有人">
                                {getFieldDecorator('mobileHolder', {
                                    initialValue: ''
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item
                                label="IMEI/MEID">
                                {getFieldDecorator('imei', {
                                    initialValue: ''
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="手机号">
                                {getFieldDecorator('mobileNumber', {
                                    initialValue: ''
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                </Form>
                <fieldset className="sample-img">
                    <legend>
                        检材图片
                    </legend>
                    <div className="imgs">
                        <div>
                            <img
                                src={front === '' ? noneImg : front} />
                            <Button
                                onClick={() => selectImageHandle('front')}
                                size="small"
                                type="primary"
                                icon="upload">
                                <span>正面</span>
                            </Button>
                        </div>
                        <div>
                            <img
                                src={back === '' ? noneImg : back} />
                            <Button
                                onClick={() => selectImageHandle('back')}
                                size="small"
                                type="primary"
                                icon="upload">
                                <span>背面</span>
                            </Button>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    }
));

export { ThreeStepForm };