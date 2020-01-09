import React, { Component, MouseEvent } from 'react';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { IObject, StoreComponent } from '@type/model';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import debounce from 'lodash/debounce';
import { remote, OpenDialogReturnValue } from 'electron';
import config from '@src/config/ui.config.json';
import './CasePath.less';

interface IProp extends StoreComponent, FormComponentProps {
    casePath: IObject;
}
interface IState {
    //*用户选择的路径
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
        selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
            const { setFieldsValue } = this.props.form;
            remote.dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
                .then((val: OpenDialogReturnValue) => {
                    if (val.filePaths && val.filePaths.length > 0) {
                        setFieldsValue({ casePath: val.filePaths[0] });
                        this.setState({ path: val.filePaths[0] });
                    }
                });
        }
        renderForm = (): JSX.Element => {
            const { getFieldDecorator } = this.props.form;
            let initPath = this.props.casePath.path || config.casePath;
            return <Form style={{ width: '100%' }}>
                <Form.Item label="存储路径">
                    {getFieldDecorator('casePath', {
                        initialValue: initPath,
                        rules: [{ required: true, message: '请选择案件路径' }]
                    })(<Input
                        addonAfter={<Icon type="ellipsis" onClick={this.selectDirHandle} />}
                        readOnly={true}
                        onClick={this.selectDirHandle} />
                    )}
                </Form.Item>
            </Form>;
        }
        render(): JSX.Element {
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

export default connect((state: IObject) => ({
    casePath: state.casePath
}))(ExtendCasePath);