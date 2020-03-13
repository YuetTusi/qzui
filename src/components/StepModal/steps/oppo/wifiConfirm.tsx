import React from 'react';
import confirm1 from '../images/wifi/oppo_confirm/wifi_confirm_1.jpg';


/**
 * OPPO_WiFi确认图
 */
const steps = [
    {
        title: '请确认',
        description: '请确认前面已经没有待连接WiFi进行采集的手机',
        content: <img src={confirm1} />
    }
];

export default steps;