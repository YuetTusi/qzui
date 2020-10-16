import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import { useMount } from '@src/hooks';
import { LocalStoreKey } from '@src/utils/localStore';
import './ClearUnit.less';


interface Prop { };

/**
 * 清空单位数据
 * @param props 
 */
const ClearUnit: FC<Prop> = (props) => {

    const [unitName, setUnitName] = useState<string | null>(null);
    const [unitCode, setUnitCode] = useState<string | null>(null);
    const [dstUnitName, setDstUnitName] = useState<string | null>(null);
    const [dstUnitCode, setDstUnitCode] = useState<string | null>(null);

    useMount(() => {
        setUnitName(localStorage.getItem(LocalStoreKey.UnitName));
        setUnitCode(localStorage.getItem(LocalStoreKey.UnitCode));
        setDstUnitName(localStorage.getItem(LocalStoreKey.DstUnitName));
        setDstUnitCode(localStorage.getItem(LocalStoreKey.DstUnitCode));
    });

    return <div className="clear-unit-root">
        <div className="clear-unit-box">
            <div className="button-box">
                <Button type="danger" onClick={() => {
                    localStorage.removeItem(LocalStoreKey.UnitName);
                    localStorage.removeItem(LocalStoreKey.UnitCode);
                    setUnitName(null);
                    setUnitCode(null);
                }}>清空</Button>
            </div>
            <div>
                <div>
                    <label>当前采集单位：</label>
                    <em>{unitName === null ? '未设置' : unitName}</em>
                </div>
                <div>
                    <label>当前采集单位编号：</label>
                    <em>{unitCode === null ? '未设置' : unitCode}</em>
                </div>
            </div>
        </div>
        <hr />
        <div className="clear-unit-box">
            <div className="button-box">
                <Button type="danger" onClick={() => {
                    localStorage.removeItem(LocalStoreKey.DstUnitName);
                    localStorage.removeItem(LocalStoreKey.DstUnitCode);
                    setDstUnitName(null);
                    setDstUnitCode(null);
                }}>清空</Button>
            </div>
            <div>
                <div>
                    <label>当前目的检验单位：</label>
                    <em>{dstUnitName === null ? '未设置' : dstUnitName}</em>
                </div>
                <div>
                    <label>当前目的检验单位编号：</label>
                    <em>{dstUnitCode === null ? '未设置' : dstUnitCode}</em>
                </div>
            </div>
        </div>
    </div>;
};

export default ClearUnit;
