import React from 'react';
import fetch1 from '../images/fetch/oppo/fetch1.jpg';
import fetch2 from '../images/fetch/oppo/fetch2.jpg';
import fetch3 from '../images/fetch/oppo/fetch3.jpg';
import fetch4 from '../images/fetch/oppo/fetch4.jpg';
import fetch5 from '../images/fetch/oppo/fetch5.png';
import fetch6 from '../images/fetch/oppo/fetch6.png';
import fetch7 from '../images/fetch/oppo/fetch7.png';
import fetch8 from '../images/fetch/oppo/fetch8.png';

/**
 * OPPO备份引导步骤图
 */
const steps = [{
    title: '点击备份与恢复',
    content: <img src={fetch1} height="580" />
}, {
    title: '点击新建备份',
    description: '去掉勾选使用密码备份用户数据',
    content: <img src={fetch2} height="580" />
}, {
    title: '勾选数据',
    description: '勾选需要备份的数据，点击开始备份',
    content: <img src={fetch3} height="580" />
}, {
    title: '完成',
    description: '数据备份成功后，点击完成按钮',
    content: <img src={fetch4} height="580" />
}, {
    title: 'oppo手机备份没有应用数据',
    content: <img src={fetch5} height="580" />
}, {
    title: '打开设置',
    description: '找到应用管理',
    content: <img src={fetch6} height="580" />
}, {
    title: '点击手机搬家',
    content: <img src={fetch7} height="580" />
}, {
    title: '点击卸载更新',
    content: <img src={fetch8} height="580" />
}];

export default steps;