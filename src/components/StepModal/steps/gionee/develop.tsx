import React from 'react';
import debug1 from '../images/develop/gionee/debug1.jpg';
import debug2 from '../images/develop/gionee/debug2.jpg';
import debug3 from '../images/develop/gionee/debug3.jpg';
import debug4 from '../images/develop/gionee/debug4.jpg';


/**
 * 金立打开开发者选项步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={debug1} height="580" />
}, {
    title: '高级设置',
    content: <img src={debug2} height="580" />
}, {
    title: '点击开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '勾选USB调试',
    content: <img src={debug4} height="580" />
}];

export default steps;