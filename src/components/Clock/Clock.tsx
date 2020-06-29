import React, { FC, useState, useEffect, useRef } from 'react';
import moment from 'moment';
import './Clock.less';

interface Prop {
    /**
     * 起始时间字串
     */
    timeFrom: string;
};

/**
 * 计时时钟
 */
const Clock: FC<Prop> = (props) => {

    let tick = moment(props.timeFrom, 'HH:mm:ss');
    let [clock, setClock] = useState<string>(props.timeFrom);
    let timer = useRef<any>();

    useEffect(() => {

        timer.current = setInterval(() => {
            setClock(tick.add(1, 's').format('HH:mm:ss'));
        }, 930);

        return () => {
            clearInterval(timer.current!);
        };
    }, []);

    return <div>{clock}</div>;
};

Clock.defaultProps = {
    timeFrom: '00:00:00'
}

export default Clock;
