import React from 'react';
import wifi1 from '../images/wifi/oppo/fetch1.jpg';
import wifi2 from '../images/wifi/oppo/fetch2.jpg';
import wifi3 from '../images/wifi/oppo/fetch3.jpg';
import wifi4 from '../images/wifi/oppo/fetch4.jpg';
import wifi5 from '../images/wifi/oppo/fetch5.jpg';
import wifi6 from '../images/wifi/oppo/fetch6.jpg';
import wifi7 from '../images/wifi/oppo/fetch7.jpg';
import wifi8 from '../images/wifi/oppo/fetch8.jpg';
import wifi9 from '../images/wifi/oppo/fetch9.jpg';
import wifi10 from '../images/wifi/oppo/fetch10.jpg';
import wifi11 from '../images/wifi/oppo/fetch11.jpg';
import wifi12 from '../images/wifi/oppo/fetch12.jpg';


/**
 * OPPO_WiFi搬家步骤图
 */
const steps = [
    {
        title: '打开网络设置',
        content: <img src={wifi1} width="580" />
    },
    {
        title: '编辑移动热点',
        content: <img src={wifi2} height="580" />
    },
    {
        title: '输入名称&密码',
        description: '名称:abco_abpc 密码:11111111',
        content: <img src={wifi3} width="680" />
    },
    {
        title: '移动热点',
        content: <img src={wifi4} width="580" />
    },
    {
        title: '确认热点名称',
        content: <img src={wifi5} width="620" />
    },
    {
        title: '点击我是旧手机',
        content: <img src={wifi6} height="580" />
    }, {
        title: '点击去连接',
        content: <img src={wifi7} height="580" />
    }, {
        title: '选择之前建立的热点',
        description: '名称为abco_abpc',
        content: <img src={wifi8} height="580" />
    }, {
        title: '输入密码',
        description: '点击加入',
        content: <img src={wifi9} height="580" />
    }, {
        title: '若未成功，点击取消',
        content: <img src={wifi10} height="580" />
    }, {
        title: '开始搬家',
        content: <img src={wifi11} height="580" />
    }, {
        title: '完成',
        content: <img src={wifi12} height="580" />
    }];

export default steps;