import React from 'react';
import fetch1 from '../images/fetch/vivo/fetch1.jpg';
import fetch2 from '../images/fetch/vivo/fetch2.jpg';
import fetch3 from '../images/fetch/vivo/fetch3.jpg';
import fetch4 from '../images/fetch/vivo/fetch4.jpg';


/**
 * VIVO备份引导步骤图
 */
const steps = [{
    title: '点击备份与恢复',
    content: <img src={fetch1} height="580" />
}, {
    title: '点击新建备份',
    content: <img src={fetch2} height="580" />
}, {
    title: '勾选数据',
    description: '勾选需要备份的数据，点击开始备份',
    content: <img src={fetch3} height="580" />
}, {
    title: '完成即可',
    description:'所有数据备份成功，点击完成按钮',
    content: <img src={fetch4} height="580" />
}];

export default steps;