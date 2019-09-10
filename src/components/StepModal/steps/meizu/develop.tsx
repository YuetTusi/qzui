import React from 'react';
import debug1 from '../images/develop/meizu/debug1.jpg';
import debug2 from '../images/develop/meizu/debug2.jpg';
import debug3 from '../images/develop/meizu/debug3.jpg';
import debug4 from '../images/develop/meizu/debug4.jpg';


/**
 * 魅族开发者选项步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={debug1} height="580" />
}, {
    title: '辅助功能',
    content: <img src={debug2} height="580" />
}, {
    title: '开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '打开USB调试',
    description: '点击允许',
    content: <img src={debug4} height="580" />
}];

export default steps;