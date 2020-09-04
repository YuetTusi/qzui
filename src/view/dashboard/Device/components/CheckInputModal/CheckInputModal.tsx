import React, { FC, MouseEvent, useRef, memo } from 'react';
import { connect } from 'dva';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import { withModeButton } from '@src/components/enhance';
import { useMount } from '@src/hooks';
import { helper } from '@src/utils/helper';
import { Backslashe } from '@src/utils/regex';
import { Prop, FormValue } from './componentTypes';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';
import apps from '@src/config/app.yaml';
import './CheckInputModal.less';

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
};

/**
 * # 案件输入框（点验版本）
 */
const CheckInputModal: FC<Prop> = (props) => {
    const caseId = useRef<string>(''); //案件id
    const casePath = useRef<string>(''); //案件存储路径
    const appList = useRef<any[]>([]); //解析App
    const isAuto = useRef<boolean>(false); //是否自动解析
    const unitName = useRef<string>(''); //检验单位

    useMount(() => {
        const { dispatch } = props;
        dispatch({ type: 'checkInputModal/queryCaseList' });
    });
    // useEffect(() => {
    //     console.clear();
    //     console.log(props.device);
    // }, [props.device]);

    /**
     * 绑定案件下拉数据
     */
    const bindCaseSelect = () => {
        const { caseList } = props.checkInputModal!;
        const { Option } = Select;
        return caseList.map((opt: CCaseInfo) => {
            let pos = opt.m_strCaseName.lastIndexOf('\\');
            let [name, tick] = opt.m_strCaseName.substring(pos + 1).split('_');
            return (
                <Option
                    value={opt.m_strCaseName.substring(pos + 1)}
                    data-case-id={opt._id}
                    data-case-path={opt.m_strCasePath}
                    data-app-list={opt.m_Applist}
                    data-is-auto={opt.m_bIsAutoParse}
                    data-unitname={opt.m_strCheckUnitName}
                    key={helper.getKey()}
                >
                    {`${name}（${helper
                        .parseDate(tick, 'YYYYMMDDHHmmss')
                        .format('YYYY-M-D H:mm:ss')}）`}
                </Option>
            );
        });
    };

    /**
     * 案件下拉Change
     */
    const caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
        caseId.current = (option as JSX.Element).props['data-case-id'] as string;
        casePath.current = (option as JSX.Element).props['data-case-path'] as string;
        appList.current = (option as JSX.Element).props['data-app-list'] as any[];
        isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
        unitName.current = (option as JSX.Element).props['data-unitname'] as string;
    };

    const resetValue = () => {
        caseId.current = ''; //案件id
        casePath.current = ''; //案件存储路径
        appList.current = []; //解析App
        isAuto.current = false; //是否自动解析
        unitName.current = ''; //检验单位
    };

    /**
     * 表单提交
     */
    const formSubmit = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();

        const { validateFields } = props.form;
        const { dispatch, saveHandle } = props;

        validateFields((errors: any, values: FormValue) => {
            if (!errors) {
                let entity = new FetchData(); //采集数据
                entity.caseName = values.case;
                entity.caseId = caseId.current;
                entity.casePath = casePath.current;
                entity.isAuto = isAuto.current;
                entity.unitName = unitName.current;
                entity.mobileName = `${values.phoneName}_${helper.timestamp()}`;
                entity.mobileNo = helper.isNullOrUndefined(values.deviceNumber)
                    ? ''
                    : values.deviceNumber;
                entity.mobileHolder = values.user; //姓名
                entity.credential = values.credential; //身份证/军官号
                entity.note = values.note; //设备手机号
                entity.serial = props.device?.serial; //序列号
                entity.mode = 1; //点验版本
                if (props.device?.manufacturer?.toLowerCase() === 'samsung') {
                    //三星手机传全部App包名
                    entity.appList = getAllAppPackage();
                } else {
                    //非三星手机传用户所选App包名
                    entity.appList = appList.current.reduce(
                        (acc: string[], current: any) => acc.concat(current.m_strPktlist),
                        []
                    );
                }
                //点验设备入库
                dispatch({ type: 'checkInputModal/insertCheckData', payload: entity });
                saveHandle!(entity);
            }
        });
    };

    const renderForm = (): JSX.Element => {
        const { Item } = Form;
        const { getFieldDecorator } = props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };

        return (
            <div>
                <Form layout="horizontal" {...formItemLayout}>
                    <Row>
                        <Col span={24}>
                            <Item label="案件名称">
                                {getFieldDecorator('case', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择案件'
                                        }
                                    ]
                                })(
                                    <Select
                                        notFoundContent="暂无数据"
                                        placeholder="选择一个案件"
                                        onChange={caseChange}
                                    >
                                        {bindCaseSelect()}
                                    </Select>
                                )}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="姓名" labelCol={{ span: 8 }} wrapperCol={{ span: 13 }}>
                                {getFieldDecorator('user', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请填写姓名'
                                        },
                                        {
                                            pattern: Backslashe,
                                            message: '不允许输入斜线字符'
                                        }
                                    ]
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="身份证/军官证号"
                                labelCol={{ span: 7 }}
                                wrapperCol={{ span: 13 }}
                            >
                                {getFieldDecorator('credential', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请填写身份证/军官证号'
                                        }
                                    ]
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 13 }}>
                                {getFieldDecorator('phoneName', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请填写手机名称'
                                        },
                                        {
                                            pattern: Backslashe,
                                            message: '不允许输入斜线字符'
                                        }
                                    ],
                                    initialValue: props.device?.model
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="设备手机号"
                                labelCol={{ span: 7 }}
                                wrapperCol={{ span: 13 }}
                            >
                                {getFieldDecorator('note', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请填写设备手机号'
                                        }
                                    ]
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Item label="手机编号">
                                {getFieldDecorator('deviceNumber', {
                                    rules: [
                                        {
                                            pattern: Backslashe,
                                            message: '不允许输入斜线字符'
                                        }
                                    ]
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    };

    return (
        <div className="case-input-modal-root">
            <Modal
                width={1000}
                visible={props.visible}
                title="取证信息录入（点验）"
                maskClosable={false}
                destroyOnClose={true}
                className="modal-style-update"
                onCancel={() => {
                    resetValue();
                    props.cancelHandle!();
                }}
                footer={[
                    <ModeButton
                        type="default"
                        icon="close-circle"
                        key={helper.getKey()}
                        onClick={() => {
                            props.cancelHandle!();
                        }}
                    >
                        取消
                    </ModeButton>,
                    <Tooltip title="点击确定后开始采集数据" key={helper.getKey()}>
                        <ModeButton type="primary" icon="check-circle" onClick={formSubmit}>
                            确定
                        </ModeButton>
                    </Tooltip>
                ]}
            >
                <div>{renderForm()}</div>
            </Modal>
        </div>
    );
};
CheckInputModal.defaultProps = {
    visible: false,
    saveHandle: () => {},
    cancelHandle: () => {}
};

const MemoCheckInputModal = memo(CheckInputModal, (prev: Prop, next: Prop) => {
    return !prev.visible && !next.visible;
});
const ExtendCheckInputModal = Form.create({ name: 'checkForm' })(MemoCheckInputModal);
export default connect((state: any) => ({ checkInputModal: state.checkInputModal }))(
    ExtendCheckInputModal
);
