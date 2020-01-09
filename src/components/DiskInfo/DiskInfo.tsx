import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { exec, ExecException } from 'child_process';
import Progress from 'antd/lib/progress';
import { helper } from '@utils/helper';
import pngDisk from './images/disk.png';
import './DiskInfo.less';

interface Prop {
    /**
     * 盘符（如C:）
     */
    disk: string;
}

/**
 * 磁盘数据
 */
interface DiskInfoData {
    /**
     * 剩余空间
     */
    FreeSpace: number;
    /**
     * 总容量
     */
    Size: number;
}

/**
 * 磁盘信息组件
 * @param props 
 */
function DiskInfo(props: PropsWithChildren<Prop>): JSX.Element {

    let [size, setSize] = useState<number>(0);
    let [freeSpace, setFreeSpace] = useState<number>(0);

    useEffect(() => {
        getDiskInfo(props.disk).then((info: DiskInfoData) => {
            setSize(info.Size);
            setFreeSpace(info.FreeSpace);
        }).catch((err: Error) => {
            console.log('读取磁盘信息失败');
        });
    }, []);

    return useMemo(() => <div className="disk-info-root">
        <img src={pngDisk} className="disk-img" />
        <Progress percent={usedPercent(freeSpace, size)} status="success" strokeLinecap="round" showInfo={false} />
    </div>, [freeSpace]);
}

/**
 * 计算磁盘空间百分比值
 * @param freeSpace 空余空间(bytes)
 * @param size 总容量(bytes)
 */
function usedPercent(freeSpace: number, size: number): number {
    const useSpace = size - freeSpace;
    return useSpace / size * 100;
}

/**
 * 取磁盘容量信息
 * @param diskName 盘符
 */
function getDiskInfo(diskName: string = 'C:'): Promise<DiskInfoData> {

    const command = `wmic logicalDisk where "Caption='${diskName}'" get FreeSpace,Size /value`;

    return new Promise((resolve, reject) => {
        exec(command, (err: ExecException | null, stdout: string) => {
            if (err) {
                reject(err);
            } else {
                let cmdResults = stdout.trim().split('\r\r\n');
                let result = cmdResults.reduce<DiskInfoData>((total, current) => {
                    return Object.assign(total, helper.keyValue2Obj(current));
                }, {} as DiskInfoData);
                resolve(result);
            }
        });
    });
}

export default DiskInfo;