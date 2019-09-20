import React, { Component, ReactElement, FormEvent } from 'react';
import { connect } from 'dva';
import { Form, Select } from 'antd';
import Title from '@src/components/title/Title';
import { IComponent, IObject } from '@src/type/model';
import { helper } from '@src/utils/helper';
import './Unit.less';

interface IProp extends IComponent {
    form: any;
    unit: any;
}

const WrappedUnit = Form.create<IProp>({ name: "edit" })(
    /**
     *  @description 采集单位
     */
    class Unit extends Component<IProp> {
        constructor(props: IProp) {
            super(props);
            this.unitFormSubmit = this.unitFormSubmit.bind(this);
        }
        componentDidMount() {
            this.fetchUnitSelect();
        }
        fetchUnitSelect() {
            this.props.dispatch({ type: 'unit/fetchUnitSelect' });
        }
        /**
         * 表单提交
         */
        unitFormSubmit() {
            const { validateFields } = this.props.form;
            validateFields((err: any, values: IObject) => {
                if (!err) {
                    console.log(values);
                }
            });
        }
        renderSelect = (): ReactElement[] => {
            const { unitData } = this.props.unit;
            const { Option } = Select;
            if (unitData && unitData.length > 0) {
                return unitData.map((item: IObject) => <Option value={item.id} key={helper.getKey()}>
                    {item.name}
                </Option>);
            } else {
                return [];
            }
        }
        renderForm = (): ReactElement => {
            const { getFieldDecorator } = this.props.form;
            return <Form>
                <Form.Item label="采集单位">
                    {getFieldDecorator("unit", {
                        rules: [{ required: true, message: '请选择采集单位' }]
                    })(<Select notFoundContent="暂无单位数据">
                        {this.renderSelect()}
                    </Select>)}
                </Form.Item>
            </Form>;
        }
        render(): ReactElement {
            return <div className="unit-root">
                <Title okText="确定" onOk={this.unitFormSubmit}>采集单位</Title>
                <div className="form-panel">
                    <div className="fm">
                        {this.renderForm()}
                    </div>
                </div>
            </div>
        }
    }
);
export default connect((state: IObject) => ({ unit: state.unit }))(WrappedUnit);