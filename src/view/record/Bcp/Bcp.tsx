import { IpcRendererEvent, ipcRenderer, remote, OpenDialogReturnValue } from 'electron';
import React, { useRef, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import throttle from 'lodash/throttle';
import Icon from 'antd/lib/icon';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/es/date-picker/locale/zh_CN';
import Radio from 'antd/lib/radio';
import Empty from 'antd/lib/empty';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Title from '@src/components/title/Title';
import Loading from '@src/components/loading/Loading';
import { useMount, useSubscribe } from '@src/hooks';
import './Bcp.less';
import { helper } from '@src/utils/helper';
import { certificateType } from '@src/schema/CertificateType';
import { caseType } from '@src/schema/CaseType';
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';
import { Prop, FormValue } from './componentType';
import { UnitRecord } from './componentType';
import { BcpEntity } from '@src/schema/socket/BcpEntity';
import { off } from 'node-notifier';


/**
 * 生成BCP
 */
const Bcp = Form.create<Prop>({ name: 'bcpForm' })((props: Prop) => {

    /**
     * 当前设备id
     */
    let deviceId = useRef<string>('');
    let unitName = useRef<string>('');//采集单位名称
    let dstUnitName = useRef<string>('');//目的检验单位名称
    let officerName = useRef<string>('');//采集人员

    const [unitData, setUnitData] = useState<UnitRecord[]>([]);    //采集单位 
    const [dstUnitData, setDstUnitData] = useState<UnitRecord[]>([]);//目的检验单位

    const queryUnitHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
        const { data } = result;
        if (data.rows && data.rows.length > 0) {
            setUnitData(data.rows);
            setDstUnitData(data.rows);
        }
    };

    useSubscribe('query-db-result', queryUnitHandle);

    useMount(() => {
        const { dispatch } = props;
        const { cid, did } = props.match.params;
        deviceId.current = did;
        dispatch({ type: 'bcp/queryCaseById', payload: cid });
        dispatch({ type: 'bcp/queryOfficerList' });
    });

    /**
     * 按关键字查询单位
     * @param {string} keyword 关键字
     */
    const queryUnitByKeyword = throttle((keyword: string) => {
        ipcRenderer.send('query-db', keyword, 1);
    }, 500);

    /**
     * 将JSON数据转为Options元素
     * @param data JSON数据
     */
    const getOptions = (data: Record<string, any>): JSX.Element[] => {
        const { Option } = Select;
        return data.map((item: Record<string, any>) =>
            <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
    }

    /**
     * 渲染标题文字
     */
    const renderTitle = () => {
        const { caseData } = props.bcp;
        if (!helper.isNullOrUndefined(caseData)) {
            let [caseName,] = caseData.m_strCaseName.split('_');
            return <span>生成BCP<strong>（{caseName}）</strong></span>;
        } else {
            return <span>生成BCP</span>;
        }
    }

    /**
     * 绑定采集人员Options
     */
    const bindOfficerList = () => {
        const { officerList } = props.bcp;
        const { Option } = Select;
        return officerList.map(i => <Option
            data-name={i.name}
            value={i.no}
            key={helper.getKey()}>
            {i.name}
        </Option>);
    };

    /**
     * 获取当前设备数据
     * @param id 设备id
     */
    const getDevice = (id: string) => {
        const { caseData } = props.bcp;
        if (helper.isNullOrUndefined(caseData)) {
            return null;
        } else {
            let device = caseData.devices.find(i => i.id === id);
            if (device === undefined) {
                return null;
            } else {
                return device;
            }
        }
    };

    /**
     * 绑定采集单位Options
     */
    const bindUnitSelect = () => {
        const { Option } = Select;
        if (unitData && unitData.length > 0) {
            return unitData.map(i => <Option
                data-name={i.PcsName}
                value={i.PcsCode}>
                {i.PcsName}
            </Option>);
        } else {
            return [];
        }
    };

    /**
     * 绑定目的检验单位Options
     */
    const bindDstUnitSelect = () => {
        const { Option } = Select;
        if (dstUnitData && dstUnitData.length > 0) {
            return dstUnitData.map(i => <Option
                data-name={i.PcsName}
                value={i.PcsCode}>
                {i.PcsName}
            </Option>);
        } else {
            return [];
        }
    };

    /**
     * 选择头像
     */
    const selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
        const { setFieldsValue } = props.form;
        remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
            ]
        }).then((val: OpenDialogReturnValue) => {
            if (val.filePaths && val.filePaths.length > 0) {
                setFieldsValue({ credentialAvatar: val.filePaths[0] });
            }
        });
    }

    /**
     * 下拉Search事件(所有单位下拉共用此回调)
     */
    const selectSearch = (keyword: string) => {
        queryUnitByKeyword(keyword);
    }


    /**
     * 采集人员ChangeEvent
     * @param value 人员编号（6位警号）
     * @param options 下拉Element数据
     */
    const officerChange = (value: string, options: Record<string, any>) => {
        officerName.current = options.props['data-name'];
    };
    /**
     * 采集单位ChangeEvent
     * @param value 单位编号
     * @param options 下拉Element数据
     */
    const unitChange = (value: string, options: Record<string, any>) => {
        unitName.current = options.props['data-name'];
    };
    /**
     * 目的检验单位ChangeEvent
     * @param value 单位编号
     * @param options 下拉Element数据
     */
    const dstUnitChange = (value: string, options: Record<string, any>) => {
        dstUnitName.current = options.props['data-name'];
    };

    /**
     * 生成Click
     */
    const bcpCreateClick = () => {
        const { validateFields } = props.form;
        validateFields((errors: Error, values: FormValue) => {
            if (errors) {
                return;
            } else {
                const bcp = new BcpEntity();
                bcp.attachment = values.attachment;
                bcp.unitNo = values.unit;
                bcp.unitName = unitName.current;
                bcp.dstUnitNo = values.dstUnit;
                bcp.dstUnitName = dstUnitName.current;
                bcp.officerNo = values.officer;
                bcp.officerName = officerName.current;
                bcp.mobileHolder = values.mobileHolder;
                bcp.credentialType = values.credentialType;
                bcp.credentialNo = values.credentialNo;
                bcp.credentialEffectiveDate = values.credentialEffectiveDate ? values.credentialEffectiveDate.format('YYYY-MM-DD') : undefined;
                bcp.credentialExpireDate = values.credentialExpireDate ? values.credentialExpireDate.format('YYYY-MM-DD') : undefined;
                bcp.credentialOrg = values.credentialOrg;
                bcp.credentialAvatar = values.credentialAvatar;
                bcp.gender = values.gender;
                bcp.nation = values.nation;
                bcp.birthday = values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined;
                bcp.address = values.address;
                bcp.securityCaseNo = values.securityCaseNo;
                bcp.securityCaseType = values.securityCaseType;
                bcp.securityCaseName = values.securityCaseName;
                bcp.handleCaseNo = values.handleCaseNo;
                bcp.handleCaseType = values.handleCaseType;
                bcp.handleCaseName = values.handleCaseName;
                bcp.handleOfficerNo = values.handleOfficerNo;

                console.log(bcp);
            }
        });
    };

    const renderForm = () => {
        const { Item } = Form;
        const { getFieldDecorator } = props.form;
        const device = getDevice(deviceId.current);
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 }
        };
        return <div className="sort">
            <Form layout="horizontal" {...formItemLayout}>
                <Row>
                    {/* <Col span={12}>
                        <Item label="附件">
                            {getFieldDecorator('attachment', {
                                rules: [{
                                    required: true,
                                    message: '请确定有无附件'
                                }],
                                initialValue: 0
                            })(<Select>
                                <Select.Option value={0}>无附件</Select.Option>
                                <Select.Option value={1}>有附件</Select.Option>
                            </Select>)}
                        </Item>
                    </Col> */}
                    <Col span={12}>
                        <Item label="附件">
                            {getFieldDecorator('attachment', {
                                rules: [{
                                    required: true,
                                    message: '请确定有无附件'
                                }],
                                initialValue: false
                            })(<Radio.Group onChange={() => { }}>
                                <Radio value={false}>无附件</Radio>
                                <Radio value={true}>有附件</Radio>
                            </Radio.Group>)}
                        </Item>
                    </Col>
                    <Col span={12}>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col span={12}>
                        <Item label="采集单位">
                            {getFieldDecorator('unit', {
                                rules: [{
                                    required: true,
                                    message: '请选择采集单位'
                                }]
                            })(<Select
                                showSearch={true}
                                placeholder={"输入单位名称进行查询"}
                                defaultActiveFirstOption={false}
                                notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                showArrow={false}
                                filterOption={false}
                                onSearch={selectSearch}
                                onChange={unitChange}
                                style={{ width: '100%' }}>
                                {bindUnitSelect()}
                            </Select>)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="目的检验单位">
                            {getFieldDecorator('dstUnit', {
                                rules: [{
                                    required: true,
                                    message: '请选择目的检验单位'
                                }]
                            })(<Select
                                showSearch={true}
                                placeholder={"输入单位名称进行查询"}
                                defaultActiveFirstOption={false}
                                notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                showArrow={false}
                                filterOption={false}
                                onSearch={selectSearch}
                                onChange={dstUnitChange}
                                style={{ width: '100%' }}>
                                {bindDstUnitSelect()}
                            </Select>)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="采集人员">
                            {getFieldDecorator('officer', {
                                rules: [{
                                    required: true,
                                    message: '请选择采集人员'
                                }]
                            })(<Select
                                onChange={officerChange}
                                notFoundContent="暂无数据">
                                {bindOfficerList()}
                            </Select>)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="手机持有人">
                            {getFieldDecorator('mobileHolder', {
                                rules: [{
                                    required: true
                                }],
                                initialValue: device?.mobileHolder
                            })(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col span={12}>
                        <Item label="证件类型">
                            {getFieldDecorator('credentialType', {
                                initialValue: '111'
                            })(<Select
                                notFoundContent="暂无数据">
                                {getOptions(certificateType)}
                            </Select>)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="证件编号">
                            {getFieldDecorator('credentialNo')(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="证件生效日期">
                            {getFieldDecorator('credentialEffectiveDate')(<DatePicker
                                locale={locale}
                                style={{ width: '100%' }} />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="证件失效日期">
                            {getFieldDecorator('credentialExpireDate')(<DatePicker
                                locale={locale}
                                style={{ width: '100%' }} />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="证件签发机关">
                            {getFieldDecorator('credentialOrg')(<Input />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="证件认证头像">
                            {getFieldDecorator('credentialAvatar')(<Input
                                addonAfter={<Icon type="ellipsis" onClick={selectDirHandle} />}
                                readOnly={true}
                                onClick={selectDirHandle} />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="性别">
                            {getFieldDecorator('gender', {
                                initialValue: '1'
                            })(<Select>
                                {getOptions(sexCode)}
                            </Select>)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="民族">
                            {getFieldDecorator('nation', {
                                initialValue: '1'
                            })(<Select>
                                {getOptions(ethnicity)}
                            </Select>)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="出生日期">
                            {getFieldDecorator('birthday')(<DatePicker
                                locale={locale}
                                style={{ width: '100%' }} />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="住址">
                            {getFieldDecorator('address')(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col span={12}>
                        <Item label="网安部门案件编号">
                            {getFieldDecorator('securityCaseNo')(<Input />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="网安部门案件类别">
                            {getFieldDecorator('securityCaseType', {
                                initialValue: '100'
                            })(<Select>
                                {getOptions(caseType)}
                            </Select>)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Item label="网安部门案件名称" labelCol={{ span: 4 }} wrapperCol={{ span: 19 }}>
                            {getFieldDecorator('securityCaseName')(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="执法办案系统案件编号">
                            {getFieldDecorator('handleCaseNo')(<Input />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="执法办案系统案件类别">
                            {getFieldDecorator('handleCaseType')(<Input />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="执法办案系统案件名称">
                            {getFieldDecorator('handleCaseName')(<Input />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="执法办案人员编号">
                            {getFieldDecorator('handleOfficerNo')(<Input />)}
                        </Item>
                    </Col>
                </Row>
            </Form>
        </div>;
    };

    return <div className="bcp-root">
        <Title
            onOk={bcpCreateClick}
            onReturn={() => props.dispatch(routerRedux.push('/record'))}
            okText="生成"
            returnText="返回">
            {renderTitle()}
        </Title>
        <div className="scroll-container">
            <div className="panel">
                <div className="sort-root">
                    {renderForm()}
                </div>
            </div>
        </div>
    </div>;

});

export default connect((state: any) => ({ bcp: state.bcp }))(Bcp);
