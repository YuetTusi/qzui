import path from 'path';
import { remote } from 'electron';
import React, { FC, memo, useRef, useState, MouseEvent } from 'react';
import Badge from 'antd/lib/badge';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import message from 'antd/lib/message';
import { helper } from '@utils/helper';
import { IP, Port } from '@utils/regex';
import { useMount } from '@src/hooks';

interface Prop {}

/**
 * 表单数据
 */
interface FormValue {
    /**
     * 点验模式
     */
    isCheck: boolean;
    /**
     * IP地址
     */
    ip: string;
    /**
     * 端口
     */
    port: string;
}

const { Item } = Form;

let jsonPath = ''; //JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
    jsonPath = path.join(remote.app.getAppPath(), './data/check.json');
} else {
    jsonPath = path.join(remote.app.getAppPath(), '../data/check.json');
}

/**
 * 比较表单数据是否完全一致
 * @param prev 原数据
 * @param next 现数据
 */
function deepEqual(prev: FormValue, next: FormValue) {
    return prev?.isCheck === next?.isCheck && prev?.ip === next?.ip && prev?.port === next?.port;
}

/**
 * 点验模式表单
 */
const CheckForm: FC<Prop> = (props) => {
    const [isDrity, setIsDirty] = useState<boolean>(false); //脏数据
    const [isCheck, setIsCheck] = useState<boolean>(false);
    const [ipValidStatus, setIpValidStatus] = useState<'error' | ''>('');
    const [portValidStatus, setPortValidStatus] = useState<'error' | ''>('');
    const [ipPlaceholder, setIpPlaceholder] = useState<string>('');
    const [portPlaceholder, setPortPlaceholder] = useState<string>('');
    const [ip, setIp] = useState<string>('');
    const [port, setPort] = useState<string>('');
    const defaultData = useRef<FormValue>();

    useMount(async () => {
        let exist = await helper.existFile(jsonPath);
        if (exist) {
            let data = (await helper.readJSONFile(jsonPath)) as FormValue;
            setIp(data.ip);
            setPort(data.port);
            setIsCheck(data.isCheck);
            defaultData.current = data;
        }
    });

    /**
     * SwitchChange事件
     */
    const switchChange = (checked: boolean) => {
        if (!checked) {
            setIpValidStatus('');
            setIpPlaceholder('');
            setPortValidStatus('');
            setPortPlaceholder('');
        }
        setIsCheck(checked);
        setIsDirty(!deepEqual(defaultData.current!, { isCheck: checked, ip, port }));
    };

    /**
     * IP地址框Change
     */
    const ipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (isCheck && value == '') {
            setIpValidStatus('error');
            setIpPlaceholder('必填');
        } else if (!IP.test(value)) {
            setIpValidStatus('error');
            setIpPlaceholder('请输入合法的IP地址');
        } else {
            setIpValidStatus('');
            setIpPlaceholder('');
        }
        setIp(value);
        setIsDirty(!deepEqual(defaultData.current!, { isCheck, port, ip: value }));
    };
    /**
     * 端口框Change
     */
    const portChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (isCheck && value == '') {
            setPortValidStatus('error');
            setPortPlaceholder('必填');
        } else if (!Port.test(value)) {
            setPortValidStatus('error');
            setPortPlaceholder('请输入合法的端口号');
        } else {
            setPortValidStatus('');
            setPortPlaceholder('');
        }
        setPort(value);
        setIsDirty(!deepEqual(defaultData.current!, { isCheck, ip, port: value }));
    };

    /**
     * 保存handle
     */
    const onSaveHandle = (event: MouseEvent<HTMLButtonElement>) => {
        let data: FormValue;
        if (isCheck) {
            if (helper.isNullOrUndefinedOrEmptyString(ip)) {
                setIpValidStatus('error');
                setIpPlaceholder('必填');
            } else if (!IP.test(ip)) {
                setIpValidStatus('error');
                setIpPlaceholder('请输入合法的IP地址');
            } else {
                setIpValidStatus('');
                setIpPlaceholder('');
            }
            if (helper.isNullOrUndefinedOrEmptyString(port)) {
                setPortValidStatus('error');
                setPortPlaceholder('必填');
            } else if (!Port.test(port)) {
                setPortValidStatus('error');
                setPortPlaceholder('请输入合法的端口号');
            } else {
                setPortValidStatus('');
                setPortPlaceholder('');
            }
            if (
                ipPlaceholder === '请输入合法的IP地址' ||
                portPlaceholder === '请输入合法的端口号'
            ) {
                message.destroy();
                message.warn(ipPlaceholder || portPlaceholder);
            } else if (ip && port) {
                data = {
                    isCheck,
                    ip: ip ?? '',
                    port: port ?? ''
                };
                helper
                    .writeJSONfile(jsonPath, data)
                    .then(() => {
                        message.destroy();
                        message.success('保存成功');
                        defaultData.current = data;
                        setIsDirty(false);
                    })
                    .catch(() => message.error('保存失败'));
            }
        } else {
            data = {
                isCheck,
                ip: ip ?? '',
                port: port ?? ''
            };
            helper
                .writeJSONfile(jsonPath, data)
                .then(() => {
                    message.success('保存成功');
                    defaultData.current = data;
                    setIsDirty(false);
                })
                .catch(() => message.error('保存失败'));
        }
    };

    return (
        <Form layout="inline" name="checkForm">
            <Item label="点验模式">
                <Switch
                    checkedChildren="开"
                    unCheckedChildren="关"
                    checked={isCheck}
                    onChange={switchChange}
                />
            </Item>
            <Item label="IP地址" hasFeedback={true} validateStatus={ipValidStatus}>
                <Input
                    onChange={ipChange}
                    value={ip}
                    style={{ width: '145px' }}
                    placeholder={ipPlaceholder}
                    disabled={!isCheck}
                />
            </Item>
            <Item label="端口" hasFeedback={true} validateStatus={portValidStatus}>
                <Input
                    onChange={portChange}
                    value={port}
                    style={{ width: '80px' }}
                    placeholder={portPlaceholder}
                    disabled={!isCheck}
                    maxLength={5}
                />
            </Item>
            <Item>
                <Badge dot={isDrity} title="未保存">
                    <Button onClick={onSaveHandle} icon="save" type="primary">
                        保存
                    </Button>
                </Badge>
            </Item>
        </Form>
    );
};

export { FormValue };
export default memo(CheckForm);
