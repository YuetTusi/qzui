import React from 'react';
import debug1 from '../images/develop/smartisan/debug1.jpg';
import debug2 from '../images/develop/smartisan/debug2.jpg';
import debug3 from '../images/develop/smartisan/debug3.jpg';
import debug4 from '../images/develop/smartisan/debug4.jpg';
import debug5 from '../images/develop/smartisan/debug5.jpg';


/**
 * 锤子打开开发者选项步骤图
 */
const steps = [{
    title: '点击设置',
    content: <img src={debug1} height="580" />
}, {
    title: '全局高级设置',
    content: <img src={debug2} height="580" />
}, {
    title: '点击开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '打开USB调试',
    description: '开启总是允许USB安装应用',
    content: <img src={debug4} height="580" />
}, {
    title: '确定',
    content: <img src={debug5} height="580" />
}];

export default steps;