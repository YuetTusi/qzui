import React from 'react';
import debug1 from '../images/develop/oneplus/debug1.jpg';
import debug2 from '../images/develop/oneplus/debug2.jpg';
import debug3 from '../images/develop/oneplus/debug3.jpg';
import debug4 from '../images/develop/oneplus/debug4.jpg';


/**
 * 一加打开开发者选项步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={debug1} height="580" />
}, {
    title: '开发者选项',
    content: <img src={debug2} height="580" />
}, {
    title: 'USB调试',
    content: <img src={debug3} height="580" />
}, {
    title: '确定',
    content: <img src={debug4} height="580" />
}];

export default steps;