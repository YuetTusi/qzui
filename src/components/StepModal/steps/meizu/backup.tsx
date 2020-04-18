import React from 'react';
import fetch1 from '../images/fetch/meizu/fetch1.jpg';
import fetch2 from '../images/fetch/meizu/fetch2.jpg';
import fetch3 from '../images/fetch/meizu/fetch3.jpg';
import fetch4 from '../images/fetch/meizu/fetch4.jpg';
import fetch5 from '../images/fetch/meizu/fetch5.jpg';
import fetch6 from '../images/fetch/meizu/fetch6.jpg';

/**
 * 魅族备份引导步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={fetch1} height="580" />
}, {
    title: '存储和备份',
    content: <img src={fetch2} height="580" />
}, {
    title: '备份手机数据',
    description: '勾选需要备份的数据，点击开始备份',
    content: <img src={fetch3} height="580" />
}, {
    title: '添加备份',
    content: <img src={fetch4} height="580" />
}, {
    title: '勾选备份文件',
    description: '等待备份完成',
    content: <img src={fetch5} height="580" />
}, {
    title: '点击完成',
    description: '数据备份成功后，点击完成',
    content: <img src={fetch6} height="580" />
}];

export default steps;