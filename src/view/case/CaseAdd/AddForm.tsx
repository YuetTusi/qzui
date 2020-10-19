import React, { MouseEvent, memo, useRef, forwardRef, useCallback } from 'react';
import { remote, OpenDialogReturnValue } from 'electron';
import throttle from 'lodash/throttle';
import AutoComplete from 'antd/lib/auto-complete';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Form, { FormComponentProps } from 'antd/lib/form';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Select from 'antd/lib/select';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import AppList from '@src/components/AppList/AppList';
import Db from '@src/utils/db';
import { useMount } from '@src/hooks';
import { helper } from '@src/utils/helper';
import { UnderLine } from '@src/utils/regex';
import { caseType } from '@src/schema/CaseType';
import CCaseInfo from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';
import { ICategory } from '@src/components/AppList/IApps';

const { Item } = Form;

/**
 * CaseAdd组件上下文
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
}

interface Prop extends FormComponentProps {
    /**
     * 历史单位名
     */
    historyUnitNames: string[];
    /**
     * 是否选择App
     */
    chooiseApp: boolean;
    /**
     * 是否拉取SD卡数据
     */
    sdCard: boolean;
    /**
     * 是否自动解析
     */
    autoParse: boolean;
    /**
     * 是否生成BCP
     */
    generateBcp: boolean;
    /**
     * 禁用生成BCP
     */
    disableGenerateBcp: boolean;
    /**
     * 有无附件
     */
    attachment: boolean;
    /**
     * 禁用有无附件
     */
    disableAttachment: boolean;
    /**
     * App数据
     */
    apps: ICategory[];
    /**
     * 上下文
     */
    context: Context;
}

const AddForm = Form.create<Prop>()(
    forwardRef<Form, Prop>((props: Prop) => {
        const { getFieldDecorator } = props.form;
        const {
            historyUnitNames,
            chooiseApp,
            sdCard,
            autoParse,
            generateBcp,
            disableGenerateBcp,
            attachment,
            disableAttachment,
            apps,
            context
        } = props;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };

        const allCaseData = useRef<CCaseInfo[]>([]);
        useMount(async () => {
            const db = new Db<CCaseInfo>(TableName.Case);
            try {
                allCaseData.current = await db.find(null);
            } catch (error) {
                allCaseData.current = [];
            }
        });

        /**
         * 选择案件路径Handle
         */
        const selectDirHandle = useCallback((event: MouseEvent<HTMLInputElement>) => {
            const { setFieldsValue } = props.form;
            remote.dialog
                .showOpenDialog({
                    properties: ['openDirectory']
                })
                .then((val: OpenDialogReturnValue) => {
                    if (val.filePaths && val.filePaths.length > 0) {
                        setFieldsValue({ m_strCasePath: val.filePaths[0] });
                    }
                });
        }, []);
        /**
         * 验证案件重名
         */
        const validCaseNameExists = useCallback(
            throttle((rule: any, value: string, callback: any) => {
                const { current } = allCaseData;
                const exists = current.find((i) => {
                    let [caseName, timestamp] = i.m_strCaseName.split('_');
                    return caseName === value;
                });
                if (exists) {
                    callback(new Error('案件名称已存在'));
                } else {
                    callback();
                }
            }, 400),
            []
        );

        /**
         * 将JSON数据转为Options元素
         * @param data JSON数据
         */
        const getOptions = useCallback((data: Record<string, string>[]): JSX.Element[] => {
            const { Option } = Select;
            return data.map((item) => (
                <Option value={item.value} key={item.value}>
                    {item.name}
                </Option>
            ));
        }, []);

        return (
            <Form {...formItemLayout}>
                <Row>
                    <Col span={24}>
                        <Item label="案件名称">
                            {getFieldDecorator('currentCaseName', {
                                rules: [
                                    { required: true, message: '请填写案件名称' },
                                    { pattern: UnderLine, message: '不允许输入下划线' },
                                    { validator: validCaseNameExists, message: '案件名称已存在' }
                                ]
                            })(<Input maxLength={30} />)}
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
                                ]
                            })(
                                <Input
                                    addonAfter={<Icon type="ellipsis" onClick={selectDirHandle} />}
                                    readOnly={true}
                                    onClick={selectDirHandle}
                                />
                            )}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Item label="检验单位">
                            {getFieldDecorator('checkUnitName', {
                                rules: [{ required: true, message: '请填写检验单位' }],
                                initialValue:
                                    helper.isNullOrUndefined(historyUnitNames) ||
                                    historyUnitNames.length === 0
                                        ? ''
                                        : historyUnitNames[0]
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
                            <Tooltip title="手动选择采集的应用">
                                <Checkbox
                                    onChange={context.chooiseAppChange}
                                    checked={chooiseApp}
                                />
                            </Tooltip>
                            <span>拉取SD卡：</span>
                            <Checkbox onChange={context.sdCardChange} checked={sdCard} />
                            <span>自动解析：</span>
                            <Tooltip title="勾选后, 取证完成将自动解析应用数据">
                                <Checkbox onChange={context.autoParseChange} checked={autoParse} />
                            </Tooltip>
                            <span>生成BCP：</span>
                            <Checkbox
                                onChange={context.generateBcpChange}
                                checked={generateBcp}
                                disabled={disableGenerateBcp}
                            />
                            <span>包含附件：</span>
                            <Checkbox
                                onChange={context.attachmentChange}
                                checked={attachment}
                                disabled={disableAttachment}
                            />
                        </div>
                    </div>
                </div>
                <div className="bcp-list" style={{ display: generateBcp ? 'block' : 'none' }}>
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
                                            required: generateBcp,
                                            message: '请选择采集人员'
                                        }
                                    ]
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
                                {getFieldDecorator('securityCaseNo')(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="网安部门案件类别"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('securityCaseType', {
                                    initialValue: '100'
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
                                {getFieldDecorator('securityCaseName')(<Input />)}
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
                                {getFieldDecorator('handleCaseNo')(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="执法办案系统案件类别"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('handleCaseType')(<Input />)}
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
                                {getFieldDecorator('handleCaseName')(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                label="执法办案人员编号"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}
                            >
                                {getFieldDecorator('handleOfficerNo')(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                </div>
                <Item className="app-list-item">
                    <div
                        className="app-list-panel"
                        style={{ display: chooiseApp ? 'block' : 'none' }}
                    >
                        <AppList apps={apps} />
                    </div>
                </Item>
            </Form>
        );
    })
);

AddForm.defaultProps = {
    chooiseApp: false,
    autoParse: true,
    generateBcp: false,
    disableGenerateBcp: false,
    attachment: false,
    disableAttachment: true,
    apps: []
};

export default memo(AddForm);
