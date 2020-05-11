import React from 'react';
import { helper } from '@utils/helper';

const { max } = helper.getConfig();

/**
 * 
 * @param cols 一列设备数据
 */
const calcRow = (cols: JSX.Element[]) => {
    if (max <= 6) {
        return <>
            <div className="row">
                {cols.slice(0, Math.trunc(max / 2))}
            </div>
            <div className="row">
                {cols.slice(Math.trunc(max / 2), max)}
            </div>
        </>;
    } else if (max % 3 === 0) {
        let quart = max / 3;
        return <>
            <div className="row">
                {cols.slice(0, quart)}
            </div>
            <div className="row">
                {cols.slice(quart, quart * 2)}
            </div>
            <div className="row">
                {cols.slice(quart * 2, max)}
            </div>
        </>;
    } else {
        return <>
            <div className="row">
                {cols.slice(0, Math.trunc(max / 2))}
            </div>
            <div className="row">
                {cols.slice(Math.trunc(max / 2), max)}
            </div>
        </>;
    }
}

export { calcRow };