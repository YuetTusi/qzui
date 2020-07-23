import React, { FC } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import debounce from 'lodash/debounce';
import Title from '@src/components/title/Title';
import { withModeButton } from '@src/components/ModeButton/modeButton';
import { StoreComponent } from '@type/model';
import { PoliceNo } from '@src/utils/regex';
import querystring from 'querystring';
import { Officer } from '@src/schema/Officer';
import './OfficerEdit.less';

const ModeButton = withModeButton()(Button);

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
        let entity = new Officer();
        validateFields((err: Error, values: Officer) => {
            if (!err) {
                if (match.params.id === '-1') {
                    //新增
                    entity = { ...values };
                } else {
                    //编辑
                    entity = {
                        ...values,
                        _id: match.params.id
                    };
                }
                dispatch({ type: 'officerEdit/saveOfficer', payload: entity });
            }
        });
    }, 1200, {
        leading: true,
        trailing: false
    });

    const renderForm = (entity: Officer) => {
        const { getFieldDecorator } = props.form;
        return <Form style={{ width: "350px", height: '200px' }}>
            <Form.Item label="姓名">
                {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请填写姓名' }],
                    initialValue: entity.name
                })(<Input prefix={<Icon type="user" />} maxLength={20} />)}
            </Form.Item>
            <Form.Item label="编号">
                {getFieldDecorator('no', {
                    rules: [
                        { required: true, message: '请填写编号' },
                        { pattern: PoliceNo, message: '6位数字' }
                    ],
                    initialValue: entity.no
                })(<Input placeholder="6位数字" prefix={<Icon type="idcard" />} />)}
            </Form.Item>
        </Form>;
    }

    const render = () => {
        const { dispatch, match, location: { search } } = props;
        const { name, no } = querystring.parse(search.substring(1));
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
                    {renderForm(new Officer({ name, no }))}
                    <div className="buttons">
                        <ModeButton type="primary" icon="save" onClick={() => saveOfficer()}>确定</ModeButton>
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