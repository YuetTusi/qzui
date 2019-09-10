import React from 'react';
import fetch1 from '../images/xiaomi/fetch1.jpg';
import fetch2 from '../images/xiaomi/fetch2.jpg';
import fetch3 from '../images/xiaomi/fetch3.jpg';
import fetch4 from '../images/xiaomi/fetch4.jpg';
import fetch5 from '../images/xiaomi/fetch5.jpg';
import fetch6 from '../images/xiaomi/fetch6.jpg';
import fetch7 from '../images/xiaomi/fetch7.jpg';


/**
 * 小米引导步骤图
 */
const steps = [{
    title: '点击设置',
    content: <img src={fetch1} width="100%" height="580" />
}, {
    title: '搜索框中输入备份进行搜索',
    content: <img src={fetch2} width="100%" height="580" />
}, {
    title: '点击备份和重置',
    content: <img src={fetch3} width="100%" height="580" />
}, {
    title: '点击本地备份',
    content: <img src={fetch4} width="100%" height="580" />
}, {
    title: '点击新建备份',
    content: <img src={fetch5} width="100%" height="580" />
}, {
    title: '勾选需要备份的数据，然后点击开始备份',
    content: <img src={fetch6} width="100%" height="580" />
}, {
    title: '等待备份完成即可',
    content: <img src={fetch7} width="100%" height="580" />
}];

export default steps;