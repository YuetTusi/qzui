import React from 'react';
import debug1 from '../images/develop/zte/debug1.jpg';
import debug2 from '../images/develop/zte/debug2.jpg';
import debug3 from '../images/develop/zte/debug3.jpg';
import debug4 from '../images/develop/zte/debug4.jpg';
import debug5 from '../images/develop/zte/debug5.jpg';


/**
 * 中兴打开开发者选项步骤图
 */
const steps = [{
    title: '点击设置',
    content: <img src={debug1} height="580" />
}, {
    title: '高级设置',
    content: <img src={debug2} height="580" />
}, {
    title: '点击开发者选项',
    content: <img src={debug3} height="580" />
}, {
    title: '打开USB调试',
    description: '以及USB安装',
    content: <img src={debug4} height="580" />
}, {
    title: '点击确定',
    content: <img src={debug5} height="580" />
}];

export default steps;