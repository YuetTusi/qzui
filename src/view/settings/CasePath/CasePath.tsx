import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { IObject, IComponent } from '@type/model';
import { Form, Upload, Input, Button, Icon } from 'antd';
import config from '@src/config/view.config';
import './CasePath.less';

interface IProp extends IComponent {
    //表单对象
    form: any;
}
interface IState {
    casePath: string;
}

/**
 * @description 案件存储路径
 */
class CasePath extends Component<IProp, IState> {
    constructor(props: any) {
        super(props);
        this.state = { casePath: config.casePath }
    }
    renderForm = (): ReactElement => {
        const { getFieldDecorator, setFieldsValue } = this.props.form;
        return <Form style={{ width: '100%' }}>
            <Form.Item label="存储路径">
                <Upload directory={true} beforeUpload={(file: any) => {
                    setFieldsValue({ casePath: file.path });
                    this.setState({ casePath: file.path });
                    return false;
                }} showUploadList={false}>
                    {getFieldDecorator('casePath', {
                        initialValue: config.casePath,
                        rules: [{ required: true, message: '请选择案件路径' }]
                    })(<Input addonAfter={<Icon type="ellipsis" />} readOnly={true} />)}
                </Upload>
            </Form.Item>
        </Form>
    }
    render(): ReactElement {
        return <div className="case-path">
            <Title okText="确定"
                onOk={() => console.log(this.state.casePath)}>案件存储路径</Title>
            <div className="case-container">
                {this.renderForm()}
            </div>
        </div>
    }
}

const ExtendCasePath = Form.create()(CasePath);
export default connect((state: IObject) => ({ state }))(ExtendCasePath);