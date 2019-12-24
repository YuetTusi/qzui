import React, { Component, MouseEvent } from 'react';
import Modal from 'antd/lib/modal';
import Form, { FormComponentProps } from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import { IObject } from '@src/type/model';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import { helper } from '@src/utils/helper';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import debounce from 'lodash/debounce';
import { getAppDataExtractType, AppDataExtractType } from '@src/schema/AppDataExtractType';

interface IProp extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 手机品牌名称
     */
    piBrand: string;
    /**
     * 手机型号
     */
    piModel: string;
    /**
     * 序列号
     */
    piSerialNumber: string;
    /**
     * 物理USB端口
     */
    piLocationID: string;
    dispatch?: Dispatch<IState>;
    caseInputModal?: IObject;
    //保存回调
    saveHandle?: (arg0: CFetchDataInfo) => void;
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
     * 设备编号
     */
    deviceNumber: string;
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
    /**
     * 采集方式
     */
    collectType: AppDataExtractType;
}

const ProxyCaseInputModal = Form.create<IProp>()(
    class CaseInputModal extends Component<IProp, IState>{
        //*保存选中检验员的名字
        officerSelectName: string;
        //*保存选中检验员的编号
        officerSelectID: string;
        //*保存选中检验单位的名字
        unitListName: string;
        //*选中的案件App列表
        appList: string[];
        //*是否自动解析
        isAuto: boolean;
        constructor(props: IProp) {
            super(props);
            this.state = {
                caseInputVisible: false,
                isBcp: false
            };
            this.unitListSearch = debounce(this.unitListSearch, 800);
            this.officerSelectName = '';
            this.officerSelectID = '';
            this.unitListName = '';
            this.appList = [];
            this.isAuto = false;
        }
        componentDidMount() {
            const dispatch = this.props.dispatch as Dispatch<IState>;
            dispatch({ type: 'caseInputModal/queryCaseList' });
            dispatch({ type: 'caseInputModal/queryOfficerList' });
            dispatch({ type: 'caseInputModal/queryUnit' });
        }
        componentWillReceiveProps(nextProp: IProp) {
            const dispatch = this.props.dispatch as Dispatch<IState>;
            this.setState({ caseInputVisible: nextProp.visible });
            if (nextProp.visible
                && nextProp.piSerialNumber !== this.props.piSerialNumber
                && nextProp.piLocationID !== this.props.piLocationID) {
                //查询采集方式下拉数据
                dispatch({
                    type: 'caseInputModal/queryCollectTypeData', payload: {
                        piSerialNumber: nextProp.piSerialNumber,
                        piLocationID: nextProp.piLocationID
                    }
                });
            }
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
                    value={opt.m_strCaseName.substring(pos + 1)}
                    data-bcp={opt.m_bIsGenerateBCP}
                    data-app-list={opt.m_Applist}
                    data-is-auto={opt.m_bIsAutoParse}
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
            return officerList.map((opt: CCheckerInfo) => {
                return <Option
                    value={opt.m_strUUID}
                    data-name={opt.m_strCheckerName}
                    data-id={opt.m_strCheckerID}
                    key={helper.getKey()}>
                    {opt.m_strCheckerID ? `${opt.m_strCheckerName}（${opt.m_strCheckerID}）` : opt.m_strCheckerName}
                </Option>
            });
        }
        /**
         * 绑定检验单位下拉
         */
        bindUnitSelect() {
            const { unitList } = this.props.caseInputModal as IObject;
            const { Option } = Select;
            return unitList.map((opt: CCheckOrganization) => {
                return <Option
                    value={opt.m_strCheckOrganizationID}
                    data-name={opt.m_strCheckOrganizationName}
                    key={helper.getKey()}>
                    {opt.m_strCheckOrganizationName}
                </Option>
            });
        }
        /**
         * 绑定采集方式下拉
         */
        bindCollectType() {
            const { Option } = Select;
            const { collectTypeList } = this.props.caseInputModal!;
            if (collectTypeList && collectTypeList.length > 0) {
                return collectTypeList.map((item: number) => {
                    return <Option
                        value={item}
                        key={helper.getKey()}>
                        {getAppDataExtractType(item)}
                    </Option>;
                });
            } else {
                return [];
            }
        }
        /**
         * 案件下拉Change
         */
        caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
            let isBcp = (option as JSX.Element).props['data-bcp'] as boolean;
            let appList = (option as JSX.Element).props['data-app-list'] as Array<string>;
            let isAuto = (option as JSX.Element).props['data-is-auto'] as boolean;
            const { setFieldsValue } = this.props.form;
            const { unitName } = (this.props.caseInputModal as IObject);
            this.setState({ isBcp });
            this.appList = appList;
            this.isAuto = isAuto;
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
            dispatch!({ type: 'caseInputModal/queryUnitData', payload: keyword });
        }
        /**
         * 检验员下拉Change事件
         */
        officerSelectChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
            const { props } = (opt as JSX.Element);
            this.officerSelectName = props['data-name'];
            this.officerSelectID = props['data-id'];
        }
        /**
         * 检验单位下拉Change事件
         */
        unitListChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
            const { children } = (opt as JSX.Element).props;
            this.unitListName = children;
        }
        /**
         * 关闭框清空属性
         */
        resetFields() {
            this.officerSelectName = '';
            this.officerSelectID = '';
            this.unitListName = '';
            this.appList = [];
            this.isAuto = false;
        }
        /**
         * 表单提交
         */
        formSubmit = (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            const { validateFields } = this.props.form;
            const { isBcp } = this.state;
            const { piSerialNumber, piLocationID } = this.props;
            validateFields((errors: any, values: IFormValue) => {
                if (!errors) {
                    let caseEntity = new CFetchDataInfo();//案件
                    caseEntity.m_strDeviceID = piSerialNumber + piLocationID;
                    caseEntity.m_strCaseName = values.case;
                    caseEntity.m_strDeviceName = `${values.name}_${helper.timestamp()}`;
                    caseEntity.m_strDeviceNumber = values.deviceNumber;
                    caseEntity.m_strDeviceHolder = values.user;
                    caseEntity.m_bIsGenerateBCP = isBcp;
                    caseEntity.m_nFetchType = values.collectType;
                    caseEntity.m_Applist = this.appList;
                    caseEntity.m_bIsAutoParse = this.isAuto;

                    if (isBcp) {
                        //*生成BCP
                        caseEntity.m_strCheckerID = this.officerSelectID;
                        caseEntity.m_strCheckerName = this.officerSelectName;
                        caseEntity.m_strCheckOrganizationID = values.unitList;
                        caseEntity.m_strCheckOrganizationName = this.unitListName;
                    } else {
                        //*不生成BCP
                        caseEntity.m_strCheckerName = values.officerInput;
                        caseEntity.m_strCheckOrganizationName = values.unitInput;
                    }
                    this.props.saveHandle!(caseEntity);
                }
            });
        }
        renderForm = (): JSX.Element => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { unitName, collectTypeList } = this.props.caseInputModal as IObject;
            const { isBcp } = this.state;
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 }
            };

            return <Form layout="horizontal" {...formItemLayout}>
                <Item label="所属案件">
                    {getFieldDecorator('case', {
                        rules: [{
                            required: true,
                            message: '请选择案件'
                        }]
                    })(<Select
                        notFoundContent="暂无数据"
                        placeholder="选择一个案件"
                        onChange={this.caseChange}>
                        {this.bindCaseSelect()}
                    </Select>)}
                </Item>
                <Item label="检验员" style={{ display: isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('officerInput', {
                        rules: [{
                            required: !isBcp,
                            message: '请填写检验员'
                        }]
                    })(<Input placeholder="检验员姓名" />)}
                </Item>
                <Item label="检验单位" style={{ display: isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('unitInput', {
                        rules: [{
                            required: !isBcp,
                            message: '请填写检验单位'
                        }],
                        initialValue: unitName
                    })(<Input placeholder={"请填写检验单位"} />)}
                </Item>
                <Item label="检验员" style={{ display: !isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('officerSelect', {
                        rules: [{
                            required: isBcp,
                            message: '请选择检验员'
                        }]
                    })(<Select
                        notFoundContent="暂无数据"
                        placeholder="请选择一位检验员"
                        onChange={this.officerSelectChange}>
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
                        placeholder={"输入单位名称进行查询"}
                        defaultActiveFirstOption={false}
                        notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                        showArrow={false}
                        filterOption={false}
                        onSearch={this.unitListSearch}
                        onChange={this.unitListChange}>
                        {this.bindUnitSelect()}
                    </Select>)}
                </Item>
                <div style={{ display: 'flex' }}>
                    <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '请填写手机名称'
                                }],
                                initialValue: this.props.piModel,
                            })(<Input />)
                        }
                    </Item>
                    <Item label="手机持有人" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('user', {
                                rules: [{
                                    required: true,
                                    message: '请填写持有人'
                                }]
                            })(<Input placeholder="持有人姓名" />)
                        }
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item label="设备编号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('deviceNumber')(<Input />)
                        }
                    </Item>
                    <Item label="采集方式" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('collectType', {
                                initialValue: collectTypeList && collectTypeList.length > 0 ? collectTypeList[0] : ''
                            })(<Select notFoundContent="暂无数据">
                                {this.bindCollectType()}
                            </Select>)
                        }
                    </Item>
                </div>
            </Form>
        }
        render(): JSX.Element {
            return <div className="case-input-modal">
                <Modal
                    width={800}
                    visible={this.state.caseInputVisible}
                    title="取证信息录入"
                    destroyOnClose={true}
                    onCancel={() => {
                        this.resetFields();
                        this.props.cancelHandle!();
                    }}
                    footer={[
                        <Button
                            type="default"
                            icon="close-circle"
                            key={helper.getKey()}
                            onClick={() => this.props.cancelHandle!()}>
                            取消
                        </Button>,
                        <Tooltip title="点击确定后开始采集数据" key={helper.getKey()}>
                            <Button
                                type="primary"
                                icon="check-circle"
                                onClick={this.formSubmit}>
                                确定
                            </Button>
                        </Tooltip>

                    ]}>
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