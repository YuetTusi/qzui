import React from 'react';
import fetch1 from '../images/fetch/huawei_phone/fetch1.jpg';
import fetch2 from '../images/fetch/huawei_phone/fetch2.jpg';
import fetch3 from '../images/fetch/huawei_phone/fetch3.jpg';
import fetch4 from '../images/fetch/huawei_phone/fetch4.jpg';
import fetch5 from '../images/fetch/huawei_phone/fetch5.jpg';
import fetch6 from '../images/fetch/huawei_phone/fetch6.jpg';
import fetch7 from '../images/fetch/huawei_phone/fetch7.jpg';

/**
 * 华为备份步骤图
 */
const steps = [{
    title: '设置',
    content: <img src={fetch1} height="580" />
}, {
    title: '高级设置',
    content: <img src={fetch2} height="580" />
}, {
    title: '备份和重置',
    content: <img src={fetch3} height="580" />
}, {
    title: '备份数据',
    content: <img src={fetch4} height="580" />
}, {
    title: '点击备份',
    content: <img src={fetch5} height="580" />
}, {
    title: '勾选内部存储',
    content: <img src={fetch6} height="580" />
}, {
    title: '勾选备份数据',
    description: '一定不要勾选系统数据，否则需要输入华为账号和密码',
    content: <img src={fetch7} height="580" />
}];

export default steps;