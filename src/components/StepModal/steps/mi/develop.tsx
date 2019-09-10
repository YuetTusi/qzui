import React from 'react';
import debug1 from '../images/develop/xiaomi/debug1.jpg';
import debug2 from '../images/develop/xiaomi/debug2.jpg';
import debug3 from '../images/develop/xiaomi/debug3.jpg';
import debug4 from '../images/develop/xiaomi/debug4.jpg';

/**
 * 小米开发者选项步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={debug1} height="580" />
}, {
    title: '更多设置',
    content: <img src={debug2} height="580" />
}, {
    title: '开发人员选项',
    content: <img src={debug3} height="580" />
}, {
    title: '勾选USB调试以及USB安装',
    content: <img src={debug4} height="580" />
}];

export default steps;