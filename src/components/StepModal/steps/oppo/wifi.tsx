import React from 'react';
import wifi1 from '../images/wifi/oppo/fetch1.jpg';
import wifi2 from '../images/wifi/oppo/fetch2.jpg';
import wifi3 from '../images/wifi/oppo/fetch3.jpg';
import wifi4 from '../images/wifi/oppo/fetch4.jpg';
import wifi5 from '../images/wifi/oppo/fetch5.jpg';
import wifi6 from '../images/wifi/oppo/fetch6.jpg';
import wifi7 from '../images/wifi/oppo/fetch7.jpg';


/**
 * OPPO_WiFi搬家步骤图
 */
const steps = [
    {
        title: '点击我是旧手机',
        content: <img src={wifi1} height="580" />
    }, {
        title: '点击去连接',
        content: <img src={wifi2} height="580" />
    }, {
        title: '选择之前建立的热点',
        description: '名称为abco_abpc',
        content: <img src={wifi3} height="580" />
    }, {
        title: '输入密码',
        description: '点击加入',
        content: <img src={wifi4} height="580" />
    }, {
        title: '若未成功，点击取消',
        content: <img src={wifi5} height="580" />
    }, {
        title: '开始搬家',
        content: <img src={wifi6} height="580" />
    }, {
        title: '完成',
        content: <img src={wifi7} height="580" />
    }];

export default steps;