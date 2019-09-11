import React from 'react';
import debug1 from '../images/develop/android/debug1.jpg';
import debug2 from '../images/develop/android/debug2.jpg';
import debug3 from '../images/develop/android/debug3.jpg';
import debug4 from '../images/develop/android/debug4.jpg';


/**
 * 能用安卓打开开发者选项步骤图
 */
const steps = [{
    title: '点击设置',
    content: <img src={debug1} height="580" />
}, {
    title: '高级设置',
    content: <img src={debug2} height="580" />
}, {
    title: '开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '勾选USB调试',
    content: <img src={debug4} height="580" />
}];

export default steps;