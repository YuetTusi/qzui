import React, { Component, ReactElement } from 'react';
import { Form, Input } from 'antd';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@type/model';
import { PoliceNo } from '@src/utils/regex';
import './OfficerEdit.less';

interface IProp extends IComponent {
    //表单
    form: any;
}

/**
 * @description 警员编辑
 */
const ExtendOfficeEdit = Form.create()(
    class OfficeEdit extends Component<IProp> {
        constructor(props: any) {
            super(props);
        }

        render(): ReactElement {
            const { getFieldDecorator } = this.props.form;
            return <div className="officer-edit">
                <Title returnText="返回" okText="确定"
                    onReturn={() => this.props.dispatch(routerRedux.push('/settings/officer'))}
                    onOk={() => alert('确定')}>
                    警员编辑
                </Title>
                <div className="center-panel">
                    <div className="input-area">
                        <div className="avatar">
                            <i></i>
                        </div>
                        <Form style={{ width: "350px", height: '200px' }}>
                            <Input type="hidden" />
                            <Form.Item label="警员姓名">
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: '请填写警员姓名' }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item label="警员编号">
                                {getFieldDecorator('no', {
                                    rules: [
                                        { required: true, message: '请填写警员编号' },
                                        { pattern: PoliceNo, message: '6位数字' }
                                    ]
                                })(<Input placeholder="6位数字" />)}
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ state }))(ExtendOfficeEdit);