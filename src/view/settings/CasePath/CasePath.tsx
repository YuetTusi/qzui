import React, { Component, ReactElement, MouseEvent } from 'react';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { IObject, IComponent } from '@type/model';
import { Form, Upload, Input, Icon } from 'antd';
import debounce from 'lodash/debounce';
import config from '@src/config/ui.config.json';
import { FormComponentProps } from 'antd/lib/form';
import './CasePath.less';

interface IProp extends IComponent, FormComponentProps {
    casePath: IObject;
}
interface IState {
    path: string;
}

const ExtendCasePath = Form.create<IProp>({ name: 'edit' })(
    /**
     * @description 案件存储路径
     */
    class CasePath extends Component<IProp, IState> {
        constructor(props: IProp) {
            super(props);
            this.state = { path: config.casePath };
            this.saveCasePath = debounce(this.saveCasePath, 1200, {
                leading: true,
                trailing: false
            });
        }
        componentDidMount() {
            const { dispatch } = this.props;
            dispatch({ type: 'casePath/queryCasePath' });
        }
        /**
         * 保存存储路径
         * @param path 存储路径
         */
        saveCasePath(path: string) {
            const { dispatch } = this.props;
            dispatch({ type: 'casePath/saveCasePath', payload: path });
        }
        saveCasePathClick = () => {
            this.saveCasePath(this.state.path);
        }
        renderForm = (): ReactElement => {
            const { getFieldDecorator, setFieldsValue } = this.props.form;
            let initPath = this.props.casePath.path || config.casePath;
            return <Form style={{ width: '100%' }}>
                <Form.Item label="存储路径">
                    <Upload directory={true} beforeUpload={(file: any) => {
                        setFieldsValue({ casePath: file.path });
                        this.setState({ path: file.path });
                        return false;
                    }} showUploadList={false}>
                        {getFieldDecorator('casePath', {
                            initialValue: initPath,
                            rules: [{ required: true, message: '请选择案件路径' }]
                        })(<Input addonAfter={<Icon type="ellipsis" />} readOnly={true} />)}
                    </Upload>
                </Form.Item>
            </Form>
        }
        render(): ReactElement {
            return <div className="case-path">
                <Title okText="确定"
                    onOk={() => this.saveCasePathClick()}>案件存储路径</Title>
                <div className="case-container">
                    {this.renderForm()}
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ casePath: state.casePath }))(ExtendCasePath);