import React, { FC } from 'react';
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

interface Prop extends StoreComponent<{ id: string }>, FormComponentProps {
    officerEdit: any;
}

/**
 * 采集人员新增/编辑
 * 路由参数为-1为新增操作
 */
const OfficeEdit: FC<Prop> = (props) => {

    /**
     * 保存采集人员
     */
    const saveOfficer = debounce(() => {
        const { validateFields } = props.form;
        const { dispatch, match } = props;
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
    }, 1200, {
        leading: true,
        trailing: false
    });

    const renderForm = (entity: CCheckerInfo) => {
        const { getFieldDecorator } = props.form;
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

    const render = () => {
        const { dispatch, match, location: { search } } = props;
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
                    {renderForm(new CCheckerInfo({ m_strCheckerName, m_strCheckerID }))}
                    <div className="buttons">
                        <Button type="primary" icon="save" onClick={() => saveOfficer()}>确定</Button>
                    </div>
                </div>
            </div>
        </div>;
    }

    return render();
}

export default connect((state: any) => ({ state }))(
    Form.create<Prop>({ name: 'edit' })(OfficeEdit)
);