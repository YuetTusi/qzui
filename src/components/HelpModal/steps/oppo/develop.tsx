import React from 'react';
import debug1 from '../images/develop/oppo/debug1.jpg';
import debug2 from '../images/develop/oppo/debug2.jpg';
import debug3 from '../images/develop/oppo/debug3.jpg';
import debug4 from '../images/develop/oppo/debug4.jpg';


/**
 * OPPO打开开发者选项步骤图
 */
const steps = [{
    title: '点击设置',
    content: <img src={debug1} height="580" />
}, {
    title: '点击其他设置',
    content: <img src={debug2} height="580" />
}, {
    title: '点击开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '点击开启',
    content: <img src={debug4} height="580" />
}];

export default steps;