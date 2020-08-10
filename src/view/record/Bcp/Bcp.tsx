import React, { FC } from 'react';
import Button from 'antd/lib/button';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/es/date-picker/locale/zh_CN';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form, { FormComponentProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Title from '@src/components/title/Title';
import { StoreComponent } from '@src/type/model';
import { useMount } from '@src/hooks';
import './Bcp.less';
import { helper } from '@src/utils/helper';
import { certificateType } from '@src/schema/CertificateType';
import { caseType } from '@src/schema/CaseType';
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';

const { Item } = Form;

interface Prop extends StoreComponent, FormComponentProps {

};

/**
 * 生成BCP
 * @param props 
 */
const Bcp = Form.create<Prop>()((props: Prop) => {

    useMount(() => {
        const { cid, did } = props.match.params;
        console.log(cid);
        console.log(did);
    });

    /**
     * 将JSON数据转为Options元素
     * @param data JSON数据
     */
    const getOptions = (data: Record<string, any>): JSX.Element[] => {
        const { Option } = Select;
        return data.map((item: Record<string, any>) =>
            <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
    }

    const renderForm = () => {
        const { Item } = Form;
        const { getFieldDecorator } = props.form;
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 }
        };
        return <div className="sort">
            <Form layout="horizontal" {...formItemLayout}>
                <Row>
                    <Col span={12}>
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
                                notFoundContent="暂无数据">
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
                                notFoundContent="暂无数据">
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
                                notFoundContent="暂无数据">
                            </Select>)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="手机持有人">
                            {getFieldDecorator('mobileHolder', {
                                rules: [{
                                    required: true
                                }]
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
                            {getFieldDecorator('credentialAvatar')(<Input />)}
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
            okText="生成"
            returnText="返回">
            生成BCP
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

export default Bcp;
