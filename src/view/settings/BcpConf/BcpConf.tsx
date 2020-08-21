import { IpcRendererEvent, ipcRenderer } from 'electron';
import React, { useState } from 'react';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import { useSubscribe, useMount } from '@src/hooks';
import Title from '@src/components/title/Title';
import { Prop, FormValue } from './componentType';
import './BcpConf.less';

const { Item } = Form;



/**
 * 维护BCP生成厂商、软件版本、序列号等信息
 * 数据在SQLite BcpConf表中维护
 */
const BcpConf = Form.create<Prop>({ name: 'bcpConfForm' })((props: Prop) => {

    const { getFieldDecorator } = props.form;

    const [data, setData] = useState<any>({});

    /**
    * 查询结果Handle
    */
    const queryBcpConfResultHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
        if (result.success) {
            setData(result.data.row);
        }
    };
    /**
     * 更新BcpConf结果
     */
    const updateBcpConfResultHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
        if (result.success) {
            message.success('保存成功');
        }
    };

    useSubscribe('query-bcp-conf-result', queryBcpConfResultHandle);
    useSubscribe('update-bcp-conf-result', updateBcpConfResultHandle);
    useMount(() => {
        ipcRenderer.send('query-bcp-conf');
    });

    const formSubmit = () => {
        const { validateFields } = props.form;

        validateFields((err, values: FormValue) => {
            if (!err) {
                ipcRenderer.send('update-bcp-conf',
                    values.manufacturer,
                    values.securitySoftwareOrgCode,
                    values.materialsName,
                    values.materialsModel,
                    values.materialsHardwareVersion,
                    values.materialsSoftwareVersion,
                    values.materialsSerial,
                    values.ipAddress,
                    values.id
                );
            }
        });
    };

    const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
    };

    return <div className="bcp-conf-root">
        <Title
            onOk={() => {
                formSubmit();
            }}
            okText="保存">
            BCP生成信息配置</Title>
        <div className="scroll-box">
            <div className="form-box">
                <Form {...formItemLayout}>
                    <Item label="制造商名称">
                        {
                            getFieldDecorator('manufacturer', {
                                initialValue: data.manufacturer
                            })(<Input />)
                        }
                    </Item>
                    <Item label="厂商组织机构代码">
                        {
                            getFieldDecorator('securitySoftwareOrgCode', {
                                initialValue: data.security_software_orgcode
                            })(<Input />)
                        }
                    </Item>
                    <Item label="采集设备名称">
                        {
                            getFieldDecorator('materialsName', {
                                initialValue: data.materials_name
                            })(<Input />)
                        }
                    </Item>
                    <Item label="设备型号">
                        {
                            getFieldDecorator('materialsModel', {
                                initialValue: data.materials_model
                            })(<Input />)
                        }
                    </Item>
                    <Item label="设备硬件版本号">
                        {
                            getFieldDecorator('materialsHardwareVersion', {
                                initialValue: data.materials_hardware_version
                            })(<Input />)
                        }
                    </Item>
                    <Item label="设备软件版本号">
                        {
                            getFieldDecorator('materialsSoftwareVersion', {
                                initialValue: data.materials_software_version
                            })(<Input />)
                        }
                    </Item>
                    <Item label="设备序列号">
                        {
                            getFieldDecorator('materialsSerial', {
                                initialValue: data.materials_serial
                            })(<Input />)
                        }
                    </Item>
                    <Item label="采集点IP">
                        {
                            getFieldDecorator('ipAddress', {
                                initialValue: data.ip_address
                            })(<Input />)
                        }
                    </Item>
                    <Item style={{ display: 'none' }}>
                        {
                            getFieldDecorator('id', {
                                initialValue: data.id
                            })(<Input type="" />)
                        }
                    </Item>

                </Form>
            </div>
        </div>
    </div>
});

export default BcpConf;
