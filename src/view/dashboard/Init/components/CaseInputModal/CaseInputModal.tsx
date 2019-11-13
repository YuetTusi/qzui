import React, { ReactElement, Component, MouseEvent } from 'react';
import { Modal, Form, Select, Input, message, Spin } from 'antd';
import { IDispatchFunc, IObject } from '@src/type/model';
import { connect } from 'dva';
import { helper } from '@src/utils/helper';
import { FormComponentProps } from 'antd/lib/form';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CCoronerInfo } from '@src/schema/CCoronerInfo';
import { CFetchCorporation } from '@src/schema/CFetchCorporation';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import debounce from 'lodash/debounce';

interface IProp extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 手机品牌名称
     */
    piMakerName: string;
    /**
     * 手机型号
     */
    piPhoneType: string;
    dispatch?: IDispatchFunc;
    caseInputModal?: IObject;
    //保存回调
    saveHandle?: (data: CFetchDataInfo) => void;
    //取消回调
    cancelHandle?: () => void;
}
interface IState {
    /**
     * 是否可见
     */
    caseInputVisible: boolean;
    /**
     * 所选案件是否生成BCP
     */
    isBcp: boolean;
}
/**
 * 表单对象
 */
interface IFormValue {
    /**
     * 案件
     */
    case: string;
    /**
     * 检验员
     */
    police: string;
    /**
     * 检验单位
     */
    unit: string;
    /**
     * 手机名称
     */
    name: string;
    /**
     * 手机持有人
     */
    user: string;
    /**
     * 检验员(BCP为false时)
     */
    officerInput: string;
    /**
     * 检验单位(BCP为false时)
     */
    unitInput: string;
    /**
     * 检验员(BCP为true时)
     */
    officerSelect: string;
    /**
     * 检验单位(BCP为true时)
     */
    unitList: string;
}

const ProxyCaseInputModal = Form.create<IProp>()(
    class CaseInputModal extends Component<IProp, IState>{
        constructor(props: IProp) {
            super(props);
            this.state = {
                caseInputVisible: false,
                isBcp: false
            };
            this.unitListSearch = debounce(this.unitListSearch, 800);
        }
        componentDidMount() {
            const dispatch = this.props.dispatch as IDispatchFunc;
            dispatch({ type: 'caseInputModal/queryCaseList' });
            dispatch({ type: 'caseInputModal/queryOfficerList' });
            dispatch({ type: 'caseInputModal/queryUnit' });
        }
        componentWillReceiveProps(nextProp: IProp) {
            this.setState({ caseInputVisible: nextProp.visible });
        }
        /**
         * 绑定案件下拉数据
         */
        bindCaseSelect() {
            const { caseList } = this.props.caseInputModal as IObject;
            const { Option } = Select;
            return caseList.map((opt: CCaseInfo) => {
                let pos = opt.m_strCaseName.lastIndexOf('\\');
                return <Option
                    value={opt.m_strCaseName}
                    data-bcp={opt.m_bIsBCP}
                    key={helper.getKey()}>
                    {opt.m_strCaseName.substring(pos + 1)}
                </Option>
            });
        }
        /**
         * 绑定检验员下拉
         */
        bindOfficerSelect() {
            // m_strCoronerName
            const { officerList } = this.props.caseInputModal as IObject;
            const { Option } = Select;
            return officerList.map((opt: CCoronerInfo) => {
                return <Option value={opt.m_strUUID} key={helper.getKey()}>
                    {opt.m_strCoronerID ? `${opt.m_strCoronerName}（${opt.m_strCoronerID}）` : opt.m_strCoronerName}
                </Option>
            });
        }
        /**
         * 绑定检验单位下拉
         */
        bindUnitSelect() {
            const { unitList } = this.props.caseInputModal as IObject;
            const { Option } = Select;
            return unitList.map((opt: CFetchCorporation) => {
                return <Option value={opt.m_strID} key={helper.getKey()}>
                    {opt.m_strName}
                </Option>
            });
        }
        /**
         * 案件下拉Change
         */
        caseChange = (value: string, option: IObject) => {
            let isBcp = option.props['data-bcp'] as boolean;
            const { setFieldsValue } = this.props.form;
            const { unitName } = (this.props.caseInputModal as IObject);
            this.setState({ isBcp });
            if (isBcp) {
                setFieldsValue({
                    officerInput: '',
                    unitInput: unitName
                });
            } else {
                setFieldsValue({
                    officerSelect: null,
                    unitList: null
                });
            }
        }
        /**
         * 检验单位下拉Search事件
         */
        unitListSearch = (keyword: string) => {
            const { dispatch } = this.props;
            dispatch!({ type: 'setFetching', payload: true });
            dispatch!({ type: 'caseInputModal/queryUnitData', payload: keyword });
        }
        /**
         * 表单提交
         */
        formSubmit = (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            const { validateFields } = this.props.form;
            const { isBcp } = this.state;
            validateFields((errors: any, values: IFormValue) => {
                if (!errors) {
                    let entity = new CFetchDataInfo();
                    entity.m_Coroner = new CCoronerInfo();
                    entity.m_strCaseName = values.case;
                    entity.m_strOwner = values.user;
                    entity.m_strPhoneID = `${values.name}_${helper.timestamp()}`;
                    entity.m_bIsBCP = isBcp;
                    if (isBcp) {
                        entity.m_Coroner.m_strUUID = values.officerSelect;
                        entity.m_strFetchCorp = values.unitList;
                    } else {
                        entity.m_Coroner.m_strCoronerName = values.officerInput;
                        entity.m_strFetchCorp = values.unitInput;
                    }
                    this.props.saveHandle!(entity);
                }
            });
        }
        renderForm = (): ReactElement => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { unitName, fetching } = this.props.caseInputModal as IObject;
            const { isBcp } = this.state;

            return <Form layout="vertical">
                <Item label="所属案件">
                    {getFieldDecorator('case', {
                        rules: [{
                            required: true,
                            message: '请选择案件'
                        }]
                    })(<Select notFoundContent="暂无数据" onChange={this.caseChange}>
                        {this.bindCaseSelect()}
                    </Select>)}
                </Item>
                <Item label="手机名称">
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: '请填写手机名称'
                            }],
                            initialValue: this.props.piPhoneType,
                        })(<Input />)
                    }
                </Item>
                <Item label="手机持有人">
                    {
                        getFieldDecorator('user', {
                            rules: [{
                                required: true,
                                message: '请填写持有人'
                            }]
                        })(<Input />)
                    }
                </Item>
                <Item label="检验员" style={{ display: isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('officerInput', {
                        rules: [{
                            required: !isBcp,
                            message: '请选择检验员'
                        }]
                    })(<Input />)}
                </Item>
                <Item label="检验单位" style={{ display: isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('unitInput', {
                        rules: [{
                            required: !isBcp,
                            message: '请填写检验单位'
                        }],
                        initialValue: unitName
                    })(<Input />)}
                </Item>
                <Item label="检验员" style={{ display: !isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('officerSelect', {
                        rules: [{
                            required: isBcp,
                            message: '请选择检验员'
                        }]
                    })(<Select notFoundContent="暂无数据">
                        {this.bindOfficerSelect()}
                    </Select>)}
                </Item>
                <Item label="检验单位" style={{ display: !isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('unitList', {
                        rules: [{
                            required: isBcp,
                            message: '请选择检验单位'
                        }]
                    })(<Select
                        showSearch={true}
                        placeholder={"请输入检验单位"}
                        defaultActiveFirstOption={false}
                        notFoundContent={fetching ? <Spin size="small" /> : null}
                        showArrow={false}
                        filterOption={false}
                        onSearch={this.unitListSearch}>
                        {this.bindUnitSelect()}
                    </Select>)}
                </Item>
            </Form>
        }
        render(): ReactElement {
            return <div className="case-input-modal">
                <Modal visible={this.state.caseInputVisible}
                    title="案件信息录入"
                    cancelText="取消"
                    okText="确定"
                    onCancel={() => this.props.cancelHandle!()}
                    onOk={this.formSubmit}
                    okButtonProps={{ icon: 'check-circle' }}
                    cancelButtonProps={{ icon: 'stop' }}
                    destroyOnClose={true}>
                    <div>
                        {this.renderForm()}
                    </div>
                </Modal>
            </div>;
        }
    }
);

export default connect((state: IObject) => {
    return {
        caseInputModal: state.caseInputModal
    }
})(ProxyCaseInputModal);