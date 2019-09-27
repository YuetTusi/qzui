import React from 'react';
import fetch1 from '../images/fetch/huawei_pc/fetch1.jpg';
import fetch2 from '../images/fetch/huawei_pc/fetch2.jpg';
import fetch3 from '../images/fetch/huawei_pc/fetch3.jpg';

/**
 * 华为备份步骤图
 */
const steps = [{
    title: '点击数据备份',
    content: <img src={fetch1} height="580" />
}, {
    title: '选择备份的应用',
    description: '去掉勾选使用密码备份用户数据，然后点击开始备份',
    content: <img src={fetch2} height="580" />
}, {
    title: '完成即可',
    content: <img src={fetch3} height="580" />
}];

export default steps;