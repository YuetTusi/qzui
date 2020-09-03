import path from 'path';
import { remote } from 'electron';
import React, { FC, memo, useState, useRef, MouseEvent } from 'react';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import message from 'antd/lib/message';
import { helper } from '@utils/helper';
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
 * 点验模式表单
 */
const CheckForm: FC<Prop> = (props) => {
    const [isCheck, setIsCheck] = useState<boolean>(false);
    const [ipValidStatus, setIpValidStatus] = useState<'error' | ''>('');
    const [portValidStatus, setPortValidStatus] = useState<'error' | ''>('');
    const [ipPlaceholder, setIpPlaceholder] = useState<string>('');
    const [portPlaceholder, setPortPlaceholder] = useState<string>('');
    const [ip, setIp] = useState<string>('');
    const [port, setPort] = useState<string>('');

    useMount(async () => {
        let exist = await helper.existFile(jsonPath);
        if (exist) {
            let data = (await helper.readJSONFile(jsonPath)) as FormValue;
            setIp(data.ip);
            setPort(data.port);
            setIsCheck(data.isCheck);
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
    };

    /**
     * IP地址框Change
     */
    const ipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (isCheck && value == '') {
            setIpValidStatus('error');
            setIpPlaceholder('必填');
        } else {
            setIpValidStatus('');
            setIpPlaceholder('');
        }
        setIp(value);
    };
    /**
     * 端口框Change
     */
    const portChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (isCheck && value == '') {
            setPortValidStatus('error');
            setPortPlaceholder('必填');
        } else {
            setPortValidStatus('');
            setPortPlaceholder('');
        }
        setPort(value);
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
            } else {
                setIpValidStatus('');
                setIpPlaceholder('');
            }
            if (helper.isNullOrUndefinedOrEmptyString(port)) {
                setPortValidStatus('error');
                setPortPlaceholder('必填');
            } else {
                setPortValidStatus('');
                setPortPlaceholder('');
            }
            if (ip && port) {
                data = {
                    isCheck,
                    ip: ip ?? '',
                    port: port ?? ''
                };
                helper
                    .writeJSONfile(jsonPath, data)
                    .then(() => message.success('保存成功'))
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
                .then(() => message.success('保存成功'))
                .catch(() => message.error('保存失败'));
        }
    };

    return (
        <Form layout="inline">
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
                />
            </Item>
            <Item>
                <Button onClick={onSaveHandle} icon="save" type="primary">
                    保存
                </Button>
            </Item>
        </Form>
    );
};

export { FormValue };
export default CheckForm;
