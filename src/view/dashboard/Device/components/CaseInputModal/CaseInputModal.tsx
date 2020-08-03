import React, { FC, MouseEvent, useEffect, useRef, memo } from 'react';
import { connect } from 'dva';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import AutoComplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import OneRenderComponent from '@src/components/enhance/OneRenderComponent';
import { withModeButton } from '@src/components/ModeButton/modeButton';
import { useMount } from '@src/hooks';
import { helper } from '@src/utils/helper';
import { Backslashe } from '@src/utils/regex';
import UserHistory, { HistoryKeys } from '@src/utils/userHistory';
import { Prop, FormValue } from './componentTypes';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';
import apps from '@src/config/app.yaml';
import './CaseInputModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 获取所有App包名
 */
const getAllAppPackage = (): string[] => {
    const { fetch } = apps;
    let selectedApp: string[] = [];
    fetch.forEach((catetory: ICategory, index: number) => {
        catetory.app_list.forEach((current: IIcon) => {
            selectedApp = selectedApp.concat(current.packages);
        });
    });
    return selectedApp;
}

const CaseInputModal: FC<Prop> = (props) => {

    const caseId = useRef<string>('');      //案件id
    const casePath = useRef<string>('');    //案件存储路径
    const appList = useRef<any[]>([]);      //解析App
    const isAuto = useRef<boolean>(false);  //是否自动解析
    const isBcp = useRef<boolean>(false);   //是否生成BCP
    const isAttachment = useRef<boolean>(false);//有无附件
    const checkerName = useRef<string>(''); //检验员
    const checkerNo = useRef<string>('');   //检验员编号
    const unitName = useRef<string>('');    //检验单位
    const dstUnitName = useRef<string>(''); //送检单位
    const historyDeviceName = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENAME));
    const historyDeviceHolder = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER));
    const historyDeviceNumber = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER));

    useMount(() => {
        const { dispatch } = props;
        dispatch({ type: 'caseInputModal/queryCaseList' });
    });

    useEffect(() => {
        historyDeviceName.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENAME);
        historyDeviceHolder.current = UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER);
        historyDeviceNumber.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER);
    }, [props.visible]);

    /**
     * 绑定案件下拉数据
     */
    const bindCaseSelect = () => {
        const { caseList } = props.caseInputModal!;
        const { Option } = Select;
        return caseList.map((opt: CCaseInfo) => {
            let pos = opt.m_strCaseName.lastIndexOf('\\');
            let [name, tick] = opt.m_strCaseName.substring(pos + 1).split('_');
            return <Option
                value={opt.m_strCaseName.substring(pos + 1)}
                data-case-id={opt._id}
                data-case-path={opt.m_strCasePath}
                data-app-list={opt.m_Applist}
                data-is-auto={opt.m_bIsAutoParse}
                data-is-bcp={opt.m_bIsGenerateBCP}
                data-is-attachment={opt.m_bIsAttachment}
                data-checkername={opt.checkerName}
                data-checkerno={opt.checkerNo}
                data-unitname={opt.m_strCheckUnitName}
                data-dst-unitname={opt.m_strDstCheckUnitName}
                key={helper.getKey()}>
                {`${name}（${helper.parseDate(tick, 'YYYYMMDDHHmmss').format('YYYY-M-D H:mm:ss')}）`}
            </Option>
        });
    }

    /**
     * 案件下拉Change
     */
    const caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
        caseId.current = (option as JSX.Element).props['data-case-id'] as string;
        casePath.current = (option as JSX.Element).props['data-case-path'] as string;
        appList.current = (option as JSX.Element).props['data-app-list'] as any[];
        isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
        isBcp.current = (option as JSX.Element).props['data-is-bcp'] as boolean;
        isAttachment.current = (option as JSX.Element).props['data-is-attachment'] as boolean;
        checkerName.current = ((option as JSX.Element).props['data-checkername']) as string;
        checkerNo.current = ((option as JSX.Element).props['data-checkerno']) as string;
        unitName.current = ((option as JSX.Element).props['data-unitname']) as string;
        dstUnitName.current = ((option as JSX.Element).props['data-dst-unitname']) as string;
    }

    const resetValue = () => {
        caseId.current = '';      //案件id
        casePath.current = '';    //案件存储路径
        appList.current = [];   //解析App
        isAuto.current = false;  //是否自动解析
        isBcp.current = false;   //是否生成BCP
        isAttachment.current = false;//有无附件
        checkerName.current = ''; //检验员
        checkerNo.current = '';//检验员编号
        unitName.current = '';//检验单位
        dstUnitName.current = '';//送检单位
    }

    /**
     * 表单提交
     */
    const formSubmit = (e: MouseEvent<HTMLElement>) => {

        e.preventDefault();

        const { validateFields } = props.form;
        const { saveHandle } = props;

        validateFields((errors: any, values: FormValue) => {
            if (!errors) {
                let entity = new FetchData();//采集数据
                entity.caseName = values.case;
                entity.caseId = caseId.current;
                entity.casePath = casePath.current;
                entity.isAuto = isAuto.current;
                entity.isBcp = isBcp.current;
                entity.isAttachment = isAttachment.current;
                entity.checkerName = checkerName.current;
                entity.checkerNo = checkerNo.current;
                entity.unitName = unitName.current;
                entity.dstUnitName = dstUnitName.current;
                entity.mobileName = `${values.phoneName}_${helper.timestamp()}`;
                entity.mobileNo = values.deviceNumber;
                entity.mobileHolder = values.user;
                entity.note = values.note;
                if (props.device?.manufacturer?.toLowerCase() === 'samsung') {
                    //三星手机传全部App包名
                    entity.appList = getAllAppPackage();
                } else {
                    //非三星手机传用户所选App包名
                    entity.appList = appList.current
                        .reduce((acc: string[], current: any) => acc.concat(current.m_strPktlist), []);
                }
                saveHandle!(entity);
            }
        });
    }

    const renderForm = (): JSX.Element => {
        const { Item } = Form;
        const { getFieldDecorator } = props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };

        return <div>
            <Form layout="horizontal" {...formItemLayout}>
                <Row>
                    <Col span={24}>
                        <Item label="案件名称">
                            {getFieldDecorator('case', {
                                rules: [{
                                    required: true,
                                    message: '请选择案件'
                                }]
                            })(<Select
                                notFoundContent="暂无数据"
                                placeholder="选择一个案件"
                                onChange={caseChange}>
                                {bindCaseSelect()}
                            </Select>)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                            {
                                getFieldDecorator('phoneName', {
                                    rules: [{
                                        required: true,
                                        message: '请填写手机名称'
                                    }, {
                                        pattern: Backslashe,
                                        message: '不允许输入斜线字符'
                                    }],
                                    initialValue: props.device?.model,
                                })(<AutoComplete
                                    dataSource={historyDeviceName.current.reduce((total: string[], current: string, index: number) => {
                                        if (index < 10 && current !== null) {
                                            total.push(current);
                                        }
                                        return total;
                                    }, [])} />)
                            }
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="手机持有人" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                            {
                                getFieldDecorator('user', {
                                    rules: [{
                                        required: true,
                                        message: '请填写持有人'
                                    }, {
                                        pattern: Backslashe,
                                        message: '不允许输入斜线字符'
                                    }]
                                })(<AutoComplete
                                    dataSource={historyDeviceHolder.current.reduce((total: string[], current: string, index: number) => {
                                        if (index < 10 && current !== null) {
                                            total.push(current);
                                        }
                                        return total;
                                    }, [])} />)
                            }
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="手机编号" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                            {
                                getFieldDecorator('deviceNumber', {
                                    rules: [{
                                        pattern: Backslashe,
                                        message: '不允许输入斜线字符'
                                    }]
                                })(<AutoComplete
                                    dataSource={historyDeviceNumber.current.reduce((total: string[], current: string, index: number) => {
                                        if (index < 10 && current !== null) {
                                            total.push(current);
                                        }
                                        return total;
                                    }, [])} />)
                            }
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="备注" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                            {
                                getFieldDecorator('note')(<Input />)
                            }
                        </Item>
                    </Col>
                </Row>
            </Form>
        </div>;
    };

    return <div className="case-input-modal-root">
        <Modal
            width={1000}
            visible={props.visible}
            title="取证信息录入"
            maskClosable={false}
            destroyOnClose={true}
            className="modal-style-update"
            onCancel={() => {
                resetValue();
                props.cancelHandle!();
            }}
            footer={[
                <OneRenderComponent>
                    <ModeButton
                        type="default"
                        icon="close-circle"
                        key={helper.getKey()}
                        onClick={() => {
                            props.cancelHandle!();
                        }}>
                        取消
                    </ModeButton>
                </OneRenderComponent>,
                <OneRenderComponent>
                    <Tooltip title="点击确定后开始采集数据" key={helper.getKey()}>
                        <ModeButton
                            type="primary"
                            icon="check-circle"
                            onClick={formSubmit}>
                            确定
                        </ModeButton>
                    </Tooltip>
                </OneRenderComponent>

            ]}>
            <div>
                {renderForm()}
            </div>
        </Modal>
    </div>;
}
CaseInputModal.defaultProps = {
    visible: false,
    saveHandle: () => { },
    cancelHandle: () => { }
};

const MemoCaseInputModal = memo(CaseInputModal, (prev: Prop, next: Prop) => {
    return !prev.visible && !next.visible;
});
const ExtendCaseInputModal = Form.create({ name: 'caseForm' })(MemoCaseInputModal);
export default connect((state: any) => ({ caseInputModal: state.caseInputModal }))(ExtendCaseInputModal);