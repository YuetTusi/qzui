import React, { FC, MouseEvent } from 'react';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import './DeviceList.less';

/**
 * 设备列表
 */
const DeviceList: FC<{
    data: DeviceType[],
    onClick: (id: string) => void
}> = ({ data, onClick }) => {

    const onLiClick = (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        onClick((event.target as any).dataset['id']);
    };

    const render = () => {
        return data.map((item: any) => {
            return <li
                onClick={onLiClick}
                key={`DL_${item._id}`} >
                <span data-id={item._id}>
                    {helper.getNameWithoutTime(item.mobileName!)}
                </span>
            </li>
        });
    };

    return <div className="device-list-box">
        <ul>{render()}</ul>
    </div>;
};

export { DeviceList };