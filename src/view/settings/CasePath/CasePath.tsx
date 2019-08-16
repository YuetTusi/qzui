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

/**
 * @description 案件存储路径
 */
class CasePath extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        const { getFieldDecorator, setFieldsValue } = this.props.form;
        return <div className="case-path">
            <Title okText="确定"
                onOk={() => alert('确定')}>案件存储路径</Title>
            <div className="case-container">
                <Form style={{ width: '100%' }}>
                    <Form.Item label="存储路径">
                        <Upload directory={true} beforeUpload={(file: any) => {
                            setFieldsValue({ casePath: file.path });
                            return false;
                        }} showUploadList={false}>
                            {getFieldDecorator('casePath', {
                                initialValue: config.casePath,
                                rules: [{ required: true, message: '请选择案件路径' }]
                            })(<Input addonAfter={<Icon type="ellipsis" />} readOnly={true} />)}
                        </Upload>
                    </Form.Item>
                </Form>
            </div>
        </div>
    }
}

const ExtendCasePath = Form.create()(CasePath);
export default connect((state: IObject) => ({ state }))(ExtendCasePath);