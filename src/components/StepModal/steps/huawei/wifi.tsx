import React from 'react';
import wifi1 from '../images/wifi/huawei/wifi1.jpg';
import wifi2 from '../images/wifi/huawei/wifi2.jpg';

/**
 * 华为WiFi采集步骤图
 */
const steps = [{
    title: '点击同意',
    content: <img src={wifi1} height="580" />
}, {
    title: '关闭',
    description: '监控ADB安装应用必须关闭',
    content: <img src={wifi2} height="580" />
}];

export default steps;