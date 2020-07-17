import React from 'react';
import debug1 from '../images/develop/motorola/debug1.jpg';
import debug2 from '../images/develop/motorola/debug2.jpg';
import debug3 from '../images/develop/motorola/debug3.jpg';
import debug4 from '../images/develop/motorola/debug4.jpg';
import debug5 from '../images/develop/motorola/debug5.jpg';


/**
 * 摩托罗拉打开开发者选项步骤图
 */
const steps = [{
    title: '点击设置',
    content: <img src={debug1} height="580" />
}, {
    title: '点击系统',
    content: <img src={debug2} height="580" />
}, {
    title: '开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '开启USB调试',
    content: <img src={debug4} height="580" />
}, {
    title: '确定',
    content: <img src={debug5} height="580" />
}];

export default steps;