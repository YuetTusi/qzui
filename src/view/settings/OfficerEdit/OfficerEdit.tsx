import React, { Component } from 'react';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import debounce from 'lodash/debounce';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@type/model';
import { PoliceNo } from '@src/utils/regex';
import uuid from 'uuid';
import querystring from 'querystring';
import { CCoronerInfo } from '@src/schema/CCoronerInfo';
import './OfficerEdit.less';

interface IProp extends IComponent, FormComponentProps {
    officerEdit: IObject;
}

/**
 * 检验员新增/编辑
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
         * 保存检验员
         */
        saveOfficer() {
            const { validateFields } = this.props.form;
            const { dispatch, match } = this.props;
            let entity: CCoronerInfo = new CCoronerInfo();
            validateFields((err: Error, values: CCoronerInfo) => {
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
        renderForm(entity: CCoronerInfo) {
            const { getFieldDecorator } = this.props.form;
            return <Form style={{ width: "350px", height: '200px' }}>
                <Form.Item label="姓名">
                    {getFieldDecorator('m_strCoronerName', {
                        rules: [{ required: true, message: '请填写姓名' }],
                        initialValue: entity.m_strCoronerName
                    })(<Input prefix={<Icon type="user" />} maxLength={20} />)}
                </Form.Item>
                <Form.Item label="编号">
                    {getFieldDecorator('m_strCoronerID', {
                        rules: [
                            { pattern: PoliceNo, message: '6位数字' }
                        ],
                        initialValue: entity.m_strCoronerID
                    })(<Input placeholder="6位数字" prefix={<Icon type="idcard" />} />)}
                </Form.Item>
            </Form>;
        }
        render(): JSX.Element {
            const { dispatch, match, location: { search } } = this.props;
            const { m_strCoronerName, m_strCoronerID } = querystring.parse(search.substring(1));
            return <div className="officer-edit">
                <Title returnText="返回" okText="确定"
                    onReturn={() => dispatch(routerRedux.push('/settings/officer'))}
                    onOk={() => this.saveOfficer()}>
                    {match.params.id === '-1' ? '新增检验员' : '编辑检验员'}
                </Title>
                <div className="center-panel">
                    <div className="input-area">
                        <div className="avatar">
                            <i></i>
                        </div>
                        {this.renderForm(new CCoronerInfo({ m_strCoronerName, m_strCoronerID }))}
                    </div>
                </div>
            </div>;
        }
    }
);

export default connect((state: IObject) => ({ state }))(ExtendOfficeEdit);