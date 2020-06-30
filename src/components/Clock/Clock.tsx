import React, { FC, useState, useEffect, useRef, memo } from 'react';
import moment from 'moment';
import './Clock.less';
import localStore from '@utils/localStore';
import { helper } from '@utils/helper';

interface Prop {
    usb: number;
};

const deviceCount: number = helper.readConf().max;

/**
 * 计时时钟
 */
const Clock: FC<Prop> = (props) => {

    const { usb } = props;
    let clockList = localStore.get('ClockList');

    const [timeString, setTimeString] = useState<string>(clockList === null ? '00:00:00' : clockList[usb]);
    let timer = useRef<any>();

    useEffect(() => {

        timer.current = setInterval(() => {

            if (clockList === null) {
                clockList = [];
                for (let i = 0; i < deviceCount; i++) {
                    clockList.push('00:00:00');
                }
                localStore.set('ClockList', clockList);
            } else {
                let next = moment(clockList[usb], 'HH:mm:ss').add(1, 's').format('HH:mm:ss');
                clockList[usb] = next;
                localStore.set('ClockList', clockList);
            }
            setTimeString(clockList[usb]);
            // console.log(localStore.get('ClockList'));
        }, 930);

        return () => {
            clearInterval(timer.current!);
        };
    }, []);

    return <div className="clock-color">{timeString}</div>;
};


export default memo(Clock);
