import React from 'react';
import fetch1 from '../images/huawei_pc/fetch1.jpg';
import fetch2 from '../images/huawei_pc/fetch2.jpg';
import fetch3 from '../images/huawei_pc/fetch3.jpg';


const steps = [
    {
        title: '点击数据备份',
        content: <img src={fetch1} width="100%" height="600" />
    }, {
        title: '选择备份的应用',
        description: '去掉勾选使用密码备份用户数据',
        content: <img src={fetch2} width="100%" height="600" />
    }, {
        title: '等待完成即可',
        content: <img src={fetch3} width="100%" height="600" />
    }
];

export default steps;