import React, { FC, MouseEvent, useEffect, useRef } from 'react';
import { connect } from 'dva';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import AutoComplete from 'antd/lib/auto-complete';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import { helper } from '@src/utils/helper';
import { Prop, FormValue } from './componentTypes';
import UserHistory, { HistoryKeys } from '@src/utils/userHistory';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';
import './CaseInputModal.less';

const CaseInputModal: FC<Prop> = (props) => {

    useEffect(() => {
        const { dispatch } = props;
        dispatch({ type: 'caseInputModal/queryCaseList' });
        dispatch({ type: 'caseInputModal/queryOfficerList' });
    }, []);

    const historyDeviceName = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENAME));
    const historyDeviceHolder = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER));
    const historyDeviceNumber = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER));

    const caseId = useRef<string>('');      //案件id
    const casePath = useRef<string>('');    //案件存储路径
    const appList = useRef<any[]>([]);   //解析App
    const isAuto = useRef<boolean>(false);  //是否自动解析
    const isBcp = useRef<boolean>(false);   //是否生成BCP
    const isAttachment = useRef<boolean>(false);//有无附件

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
    }

    /**
     * 绑定采集方式Select
     */
    const bindFetchType = () => {

        let fetchType = props.device?.fetchType;
        const { Option } = Select;
        if (!helper.isNullOrUndefined(fetchType)) {
            return fetchType?.map((item: string) => <Option value={item}>{item}</Option>);
        } else {
            return [];
        }
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
                let entity = new FetchData();//案件
                entity.caseName = values.case;
                entity.caseId = caseId.current;
                entity.casePath = casePath.current;
                entity.appList = appList.current.reduce((acc: any, current: any) => {
                    acc.push(...current.m_strPktlist);
                    return acc;
                }, []);
                entity.isAuto = isAuto.current;
                entity.isBcp = isBcp.current;
                entity.isAttachment = isAttachment.current;
                entity.mobileName = `${values.phoneName}_${helper.timestamp()}`;
                entity.mobileNo = values.deviceNumber;
                entity.mobileHolder = values.user;
                entity.fetchType = values.collectType.toString();

                saveHandle!(entity);

                // if (caseEntity.m_nFetchType === AppDataExtractType.ANDROID_DOWNGRADE_BACKUP) {
                //     //# 采集方式为`降级备份`给用户弹提示
                //     Modal.confirm({
                //         title: '风险警示',
                //         content: '降级备份可能造成数据损坏，确认使用？',
                //         okText: '继续',
                //         cancelText: '取消',
                //         iconType: 'warning',
                //         onOk() {
                //             saveHandle!(caseEntity);
                //         }
                //     });
                // } else if (piUserlist && piUserlist.length === 1) {
                //     //# 如果采集的设备有`多用户`或`隐私空间`等情况，要给用户弹出提示
                //     Modal.confirm({
                //         title: '请确认',
                //         content: confirmText(piUserlist[0]),
                //         okText: '开始取证',
                //         cancelText: '取消',
                //         onOk() {
                //             saveHandle!(caseEntity);
                //         }
                //     });
                // } else if (piUserlist && piUserlist.length === 2) {
                //     Modal.confirm({
                //         title: '请确认',
                //         content: confirmText(-1),
                //         okText: '开始取证',
                //         cancelText: '取消',
                //         onOk() {
                //             saveHandle!(caseEntity);
                //         }
                //     });
                // } else {
                //     saveHandle!(caseEntity);
                // }
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
                                getFieldDecorator('deviceNumber')(<AutoComplete
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
                        <Item label="采集方式" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                            {
                                getFieldDecorator('collectType', {
                                    initialValue: helper.isNullOrUndefined(props.device?.fetchType) ? '' : props.device?.fetchType![0]
                                })(<Select notFoundContent="暂无数据">
                                    {bindFetchType()}
                                </Select>)
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
            destroyOnClose={true}
            className="modal-style-update"
            onCancel={() => {
                // this.resetFields();
                props.cancelHandle!();
            }}
            footer={[
                <Button
                    type="default"
                    icon="close-circle"
                    key={helper.getKey()}
                    onClick={() => {
                        props.cancelHandle!();
                    }}>
                    取消
                </Button>,
                <Tooltip title="点击确定后开始采集数据" key={helper.getKey()}>
                    <Button
                        type="primary"
                        icon="check-circle"
                        onClick={formSubmit}>
                        确定</Button>
                </Tooltip>
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

const ExtendCaseInputModal = Form.create({ name: 'caseForm' })(CaseInputModal);
export default connect((state: any) => ({ caseInputModal: state.caseInputModal }))(ExtendCaseInputModal);
