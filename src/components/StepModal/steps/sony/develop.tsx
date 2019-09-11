import React from 'react';
import debug1 from '../images/develop/sony/debug1.jpg';
import debug2 from '../images/develop/sony/debug2.jpg';
import debug3 from '../images/develop/sony/debug3.jpg';
import debug4 from '../images/develop/sony/debug4.jpg';
import debug5 from '../images/develop/sony/debug5.jpg';


/**
 * 一加打开开发者选项步骤图
 */
const steps = [{
    title: '点击设定',
    content: <img src={debug1} height="580" />
}, {
    title: '系统',
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