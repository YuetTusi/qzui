import React from 'react';
import img1 from '../../images/apk/TZSafe/tzsafe_1.jpg';
import img2 from '../../images/apk/TZSafe/tzsafe_2.jpg';
import img3 from '../../images/apk/TZSafe/tzsafe_3.jpg';


/**
 * 金立打开开发者选项步骤图
 */
const steps = [{
    title: '进入文件管理',
    content: <img src={img1} height="580" />
}, {
    title: '点击所有文件',
    description: '进入11tzsafe目录',
    content: <img src={img2} height="580" />
}, {
    title: '安装',
    description: '点击安装TZSafe.apk',
    content: <img src={img3} height="580" />
}];

export default steps;