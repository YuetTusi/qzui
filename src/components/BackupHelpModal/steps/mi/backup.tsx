import React from 'react';
import fetch1 from '../images/fetch/xiaomi/fetch1.jpg';
import fetch2 from '../images/fetch/xiaomi/fetch2.jpg';
import fetch3 from '../images/fetch/xiaomi/fetch3.jpg';
import fetch4 from '../images/fetch/xiaomi/fetch4.jpg';
import fetch5 from '../images/fetch/xiaomi/fetch5.jpg';
import fetch6 from '../images/fetch/xiaomi/fetch6.jpg';
import fetch7 from '../images/fetch/xiaomi/fetch7.jpg';
import fetch8 from '../images/fetch/xiaomi/fetch8.jpg';

/**
 * 小米备份步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={fetch1} height="580" />
}, {
    title: '搜索框中输入备份进行搜索',
    content: <img src={fetch2} height="580" />
}, {
    title: '备份和重置',
    content: <img src={fetch3} height="580" />
}, {
    title: '本地备份',
    content: <img src={fetch4} height="580" />
}, {
    title: '新建备份',
    content: <img src={fetch5} height="580" />
}, {
    title: '勾选备份数据',
    description: '然后点击开始备份',
    content: <img src={fetch6} height="580" />
}, {
    title: '等待备份完成',
    content: <img src={fetch7} height="580" />
}, {
    title: '点击完成按钮',
    description: '数据备份成功后，请点击完成按钮',
    content: <img src={fetch8} height="580" />
}];

export default steps;