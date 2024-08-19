import { join } from 'path';
import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { Button, Checkbox, Modal } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { helper } from '@src/utils/helper';
import { StandardJson, StandardModalProp } from './prop';
import './StandardModal.less';

const { Group } = Checkbox;
let standardJson: StandardJson | null = null;
const target = helper.IS_DEV
    ? join(helper.CWD, 'data/standard.json')
    : join(helper.CWD, 'resources/config/standard.json');

const StandardModal: FC<StandardModalProp> = ({
    open, defaultValue, onCancel, onOk
}) => {

    const [data, setData] = useState<StandardJson>({ gb: [], sf: [] });

    useEffect(() => {
        if (standardJson === null) {
            (async () => {
                try {
                    standardJson = await helper.readJSONFile(target);
                    setData(standardJson!);
                } catch (error) {
                    console.warn(error);
                }
            })();
        }
    }, []);

    useEffect(() => {
        if (standardJson) {
            standardJson.gb = standardJson.gb.map(item => {
                const has = (defaultValue ?? []).some(i => i === item.value);
                item.checked = has;
                return item;
            });
            standardJson.sf = standardJson.sf.map(item => {
                const has = (defaultValue ?? []).some(i => i === item.value);
                if (has) {
                    item.checked = has;
                }
                return item;
            });
            setData(standardJson);
        }
    }, [open, defaultValue]);

    const toOptions = (item: { value: string, disabled: boolean, checked: boolean }[]) =>
        item.map((i) => ({
            label: i.value,
            value: i.value,
            disabled: i.disabled,
            checked: i.checked
        }));

    const onOkClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const gb = data.gb.filter(i => i.checked).map(i => i.value);
        const sf = data.sf.filter(i => i.checked).map(i => i.value);
        console.log(gb, sf);
        onOk([...gb, ...sf]);
    };

    const onGbChange = (checkValue: CheckboxValueType[]) => {
        const next = data.gb.map(item => {
            const has = checkValue.find(i => i === item.value);
            item.checked = has !== undefined;
            return item;
        });
        setData(prev => ({ ...prev, gb: next }));
    };

    const onSfChange = (checkValue: CheckboxValueType[]) => {
        const next = data.sf.map(item => {
            const has = checkValue.find(i => i === item.value);
            item.checked = has !== undefined;
            return item;
        });
        setData(prev => ({ ...prev, sf: next }));
    };

    return <Modal
        footer={[
            <Button
                onClick={onCancel}
                type="default"
                icon="close-circle"
                key="SM_0">取消</Button>,
            <Button
                onClick={onOkClick}
                type="primary"
                icon="check-circle"
                key="SM_1">确定</Button>
        ]}
        visible={open}
        onCancel={onCancel}
        maskClosable={false}
        destroyOnClose={true}
        zIndex={9999}
        getContainer="#root"
        title="检测方法">
        <div className="standard-modal-root">
            <fieldset className="stand-sort">
                <legend>
                    国家标准
                </legend>
                <Group
                    onChange={onGbChange}
                    options={toOptions(data.gb)}
                    defaultValue={data.gb.filter(i => i.checked).map(i => i.value)}
                    name="gb" />
            </fieldset>
            <fieldset className="stand-sort">
                <legend>
                    司法规范
                </legend>
                <Group
                    onChange={onSfChange}
                    defaultValue={data.sf.filter(i => i.checked).map(i => i.value)}
                    options={toOptions(data.sf)}
                    name="sf" />
            </fieldset>
        </div>
    </Modal>
};

export { StandardModal };