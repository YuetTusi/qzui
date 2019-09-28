import React from 'react';
import debug1 from '../images/develop/lenovo/debug1.jpg';
import debug2 from '../images/develop/lenovo/debug2.jpg';
import debug3 from '../images/develop/lenovo/debug3.jpg';
import debug4 from '../images/develop/lenovo/debug4.jpg';


/**
 * 联想打开开发者选项步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={debug1} height="580" />
}, {
    title: '点击系统',
    content: <img src={debug2} height="580" />
}, {
    title: '开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '打开USB调试',
    description: '点击确定',
    content: <img src={debug4} height="580" />
}];

export default steps;