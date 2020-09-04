import React, { forwardRef } from 'react';
import Form, { FormComponentProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Select from 'antd/lib/select';
import AutoComplete from 'antd/lib/auto-complete';
import Empty from 'antd/lib/empty';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import AppList from '@src/components/AppList/AppList';
import { ExtendCaseInfo } from '@src/model/case/CaseEdit/CaseEdit';
import { helper } from '@src/utils/helper';
import { LeftUnderline } from '@src/utils/regex';
import { caseType } from '@src/schema/CaseType';

/**
 * CaseEdit组件上下文
 */
interface Context {
    /**
     * 选择AppChange事件
     */
    chooiseAppChange: (e: CheckboxChangeEvent) => void;
    /**
     * 拉取SD卡Change事件
     */
    sdCardChange: (e: CheckboxChangeEvent) => void;
    /**
     * 自动解析Change事件
     */
    autoParseChange: (e: CheckboxChangeEvent) => void;
    /**
     * 生成BCPChange事件
     */
    generateBcpChange: (e: CheckboxChangeEvent) => void;
    /**
     * 有无附件Change事件
     */
    attachmentChange: (e: CheckboxChangeEvent) => void;
    /**
     * 采集人员Change事件
     */
    officerChange: (
        value: string,
        option: React.ReactElement<any> | React.ReactElement<any>[]
    ) => void;
    /**
     * 绑定采集人员Options
     */
    bindOfficerOptions: () => JSX.Element;
    /**
     * 采集人员初始化值
     */
    getOfficerInitVal: (officerNo: string) => void;
}

interface Prop extends FormComponentProps {
    /**
     * 数据
     */
    data: ExtendCaseInfo;
    historyUnitNames: string[];
    context: Context;
}

const getCaseName = (caseName?: string) => {
    if (helper.isNullOrUndefined(caseName)) {
        return '';
    } else {
        return caseName!.match(LeftUnderline)![0];
    }
};

/**
 * 将JSON数据转为Options元素
 * @param data JSON数据
 */
const getOptions = (data: Record<string, string | number>[]): JSX.Element[] => {
    const { Option } = Select;
    return data.map<JSX.Element>((item: Record<string, string | number>) => (
        <Option value={item.value} key={helper.getKey()}>
            {item.name}
        </Option>
    ));
};

/**
 * 表单
 */
const EditForm = Form.create<Prop>()(
    forwardRef<Form, Prop>((props, ref) => {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };
        const { Item } = Form;
        const { data, historyUnitNames, context } = props;
        const { getFieldDecorator } = props.form;

        return (
            <Form {...formItemLayout}>
                <Row>
                    <Col span={24}>
                        <Item label="案件名称">
                            {getFieldDecorator('currentCaseName', {
                                rules: [{ required: true, message: '请填写案件名称' }],
                                initialValue: getCaseName(data.m_strCaseName)
                            })(
                                <Input
                                    prefix={<Icon type="profile" />}
                                    maxLength={100}
                                    disabled={true}
                                />
                            )}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Item label="存储路径">
                            {getFieldDecorator('m_strCasePath', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请选择存储路径'
                                    }
                                ],
                                initialValue: data.m_strCasePath
                            })(
                                <Input
                                    addonAfter={<Icon type="ellipsis" />}
                                    disabled={true}
                                    readOnly={true}
                                />
                            )}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Item label="检验单位">
                            {getFieldDecorator('m_strCheckUnitName', {
                                rules: [{ required: true, message: '请填写检验单位' }],
                                initialValue: data.m_strCheckUnitName
                            })(
                                <AutoComplete
                                    dataSource={
                                        helper.isNullOrUndefined(historyUnitNames)
                                            ? []
                                            : historyUnitNames.reduce(
                                                  (
                                                      total: string[],
                                                      current: string,
                                                      index: number
                                                  ) => {
                                                      if (
                                                          index < 10 &&
                                                          !helper.isNullOrUndefinedOrEmptyString(
                                                              current
                                                          )
                                                      ) {
                                                          total.push(current);
                                                      }
                                                      return total;
                                                  },
                                                  []
                                              )
                                    }
                                />
                            )}
                        </Item>
                    </Col>
                </Row>
                <div className="checkbox-panel">
                    <div className="ant-col ant-col-4 ant-form-item-label">
                        <label>选择APP</label>
                    </div>
                    <div className="ant-col ant-col-18 ant-form-item-control-wrapper">
                        <div className="inner">
                            <Checkbox
                                onChange={context.chooiseAppChange}
                                checked={data.chooiseApp}
                            />
                            <span>拉取SD卡：</span>
                            <Checkbox onChange={context.sdCardChange} checked={data.sdCard} />
                            <span>自动解析：</span>
                            <Checkbox
                                onChange={context.autoParseChange}
                                checked={data.m_bIsAutoParse}
                            />
                            <span>生成BCP：</span>
                            <Checkbox
                                onChange={context.generateBcpChange}
                                disabled={!data.m_bIsAutoParse}
                                checked={data.generateBcp}
                            />
                            <span>包含附件：</span>
                            <Checkbox
                                onChange={context.attachmentChange}
                                checked={data.attachment}
                                disabled={!data.m_bIsAutoParse || !data.generateBcp}
                            />
                        </div>
                    </div>
                </div>
                <div className="bcp-list" style={{ display: data.generateBcp ? 'block' : 'none' }}>
                    <div className="bcp-list-bar">
                        <Icon type="appstore" rotate={45} />
                        <span>BCP信息</span>
                    </div>
                    <Row>
                        <Col span={12}>
                            <Item labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} label="采集人员">
                                {getFieldDecorator('officerNo', {
                                    rules: [
                                        {
                                            required: data.generateBcp,
                                            message: '请选择采集人员'
                                        }
                                    ],
                                    initialValue: context.getOfficerInitVal(data.officerNo)
                                })(
                                    <Select
                                        onChange={context.officerChange}
                                        notFoundContent={
                                            <Empty
                                                description="暂无采集人员"
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            />
                                        }
                                    >
                                        {context.bindOfficerOptions()}
                                    </Select>
                                )}
                            </Item>
                        </Col>
                        <Col span={12} />
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item
                                label="网安部门案件编号"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('securityCaseNo', {
                                    initialValue: data.securityCaseNo
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="网安部门案件类别"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('securityCaseType', {
                                    initialValue: data.securityCaseType
                                })(<Select>{getOptions(caseType)}</Select>)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Item
                                label="网安部门案件名称"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 18 }}
                            >
                                {getFieldDecorator('securityCaseName', {
                                    initialValue: data.securityCaseName
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item
                                label="执法办案系统案件编号"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('handleCaseNo', {
                                    initialValue: data.handleCaseNo
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="执法办案系统案件类别"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('handleCaseType', {
                                    initialValue: data.handleCaseType
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item
                                label="执法办案系统案件名称"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('handleCaseName', {
                                    initialValue: data.handleCaseName
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="执法办案人员编号"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('handleOfficerNo', {
                                    initialValue: data.handleOfficerNo
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                </div>
                <Item className="app-list-item">
                    <div
                        className="app-list-panel"
                        style={{ display: data.chooiseApp ? 'block' : 'none' }}
                    >
                        <AppList apps={data.apps} />
                    </div>
                </Item>
            </Form>
        );
    })
);

export default EditForm;
