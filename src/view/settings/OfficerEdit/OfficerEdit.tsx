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
    officerEdit: IObject;
}

/**
 * @description 检验员编辑
 */
const ExtendOfficeEdit = Form.create()(
    class OfficeEdit extends Component<IProp> {
        constructor(props: any) {
            super(props);
        }
        /**
         * 保存检验员
         */
        saveOfficer() {
            const { validateFields } = this.props.form;
            const { dispatch } = this.props;
            validateFields((err: Error, values: IObject) => {
                if (err) {
                    console.log(err);
                } else {
                    dispatch({ type: 'officerEdit/saveOfficer', payload: values });
                }
            });
        }
        renderForm() {
            const { getFieldDecorator } = this.props.form;
            return <Form style={{ width: "350px", height: '200px' }}>
                <Input type="hidden" />
                <Form.Item label="检验员姓名">
                    {getFieldDecorator('m_strCoronerName', {
                        rules: [{ required: true, message: '请填写检验员姓名' }]
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="检验员编号">
                    {getFieldDecorator('m_strCoronerID', {
                        rules: [
                            { pattern: PoliceNo, message: '6位数字' }
                        ]
                    })(<Input placeholder="6位数字" />)}
                </Form.Item>
            </Form>
        }
        render(): ReactElement {
            const { dispatch } = this.props;
            return <div className="officer-edit">
                <Title returnText="返回" okText="确定"
                    onReturn={() => dispatch(routerRedux.push('/settings/officer'))}
                    onOk={() => this.saveOfficer()}>
                    检验员编辑
                </Title>
                <div className="center-panel">
                    <div className="input-area">
                        <div className="avatar">
                            <i></i>
                        </div>
                        {this.renderForm()}
                    </div>
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ state }))(ExtendOfficeEdit);