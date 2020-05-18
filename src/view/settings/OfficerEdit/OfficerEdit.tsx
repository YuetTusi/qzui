import React, { Component } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import debounce from 'lodash/debounce';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent } from '@type/model';
import { PoliceNo } from '@src/utils/regex';
import uuid from 'uuid';
import querystring from 'querystring';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import './OfficerEdit.less';

interface IProp extends StoreComponent<{ id: string }>, FormComponentProps {
    officerEdit: any;
}

/**
 * 采集人员新增/编辑
 * 路由参数为-1为新增操作
 */
const ExtendOfficeEdit = Form.create<IProp>({ name: 'edit' })(
    class OfficeEdit extends Component<IProp> {
        constructor(props: IProp) {
            super(props);
            this.saveOfficer = debounce(this.saveOfficer, 1200, {
                leading: true,
                trailing: false
            });
        }
        /**
         * 保存采集人员
         */
        saveOfficer() {
            const { validateFields } = this.props.form;
            const { dispatch, match } = this.props;
            let entity: CCheckerInfo = new CCheckerInfo();
            validateFields((err: Error, values: CCheckerInfo) => {
                if (!err) {
                    if (match.params.id === '-1') {
                        //新增
                        entity = {
                            ...values,
                            m_strUUID: uuid()
                        }
                    } else {
                        //编辑
                        entity = {
                            ...values,
                            m_strUUID: match.params.id
                        };
                    }
                    dispatch({ type: 'officerEdit/saveOfficer', payload: entity });
                }
            });
        }
        renderForm(entity: CCheckerInfo) {
            const { getFieldDecorator } = this.props.form;
            return <Form style={{ width: "350px", height: '200px' }}>
                <Form.Item label="姓名">
                    {getFieldDecorator('m_strCheckerName', {
                        rules: [{ required: true, message: '请填写姓名' }],
                        initialValue: entity.m_strCheckerName
                    })(<Input prefix={<Icon type="user" />} maxLength={20} />)}
                </Form.Item>
                <Form.Item label="编号">
                    {getFieldDecorator('m_strCheckerID', {
                        rules: [
                            { required: true, message: '请填写编号' },
                            { pattern: PoliceNo, message: '6位数字' }
                        ],
                        initialValue: entity.m_strCheckerID
                    })(<Input placeholder="6位数字" prefix={<Icon type="idcard" />} />)}
                </Form.Item>
            </Form>;
        }
        render(): JSX.Element {
            const { dispatch, match, location: { search } } = this.props;
            const { m_strCheckerName, m_strCheckerID } = querystring.parse(search.substring(1));
            return <div className="officer-edit">
                <Title
                    returnText="返回"
                    onReturn={() => dispatch(routerRedux.push('/settings/officer'))}>
                    {match.params.id === '-1' ? '新增采集人员' : '编辑采集人员'}
                </Title>
                <div className="center-panel">
                    <div className="input-area">
                        <div className="avatar">
                            <i></i>
                        </div>
                        {this.renderForm(new CCheckerInfo({ m_strCheckerName, m_strCheckerID }))}
                        <div className="buttons">
                            <Button type="primary" icon="save" onClick={() => this.saveOfficer()}>确定</Button>
                        </div>
                    </div>
                </div>
            </div>;
        }
    }
);

export default connect((state: any) => ({ state }))(ExtendOfficeEdit);