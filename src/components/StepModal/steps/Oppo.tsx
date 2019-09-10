import React from 'react';
import fetch1 from '../images/oppo/fetch1.jpg';
import fetch2 from '../images/oppo/fetch2.jpg';
import fetch3 from '../images/oppo/fetch3.jpg';
import fetch4 from '../images/oppo/fetch4.jpg';


/**
 * OPPO引导步骤图
 */
const steps = [{
    title: '点击备份与恢复',
    content: <img src={fetch1} height="580" />
}, {
    title: '点击新建备份',
    description: '去掉勾选使用密码备份用户数据',
    content: <img src={fetch2} height="580" />
}, {
    title: '勾选数据',
    description: '勾选需要备份的数据，点击开始备份',
    content: <img src={fetch3} height="580" />
}, {
    title: '完成',
    content: <img src={fetch4} height="580" />
}];

export default steps;