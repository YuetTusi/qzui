import React, { FC, memo } from 'react';

/**
 * 提示文案
 */
const ApkTip: FC<{}> = memo(() => {


    return <fieldset className="tip-msg full">
        <legend>操作提示</legend>
        {/* <div className="sub-tip">功能：</div> */}
        <ul>
            <li>
                请连接手机USB线
            </li>
            <li>
                选择要提取的设备及存储位置，<strong>勾选提取的apk</strong>文件，点击「<strong>提取选择apk</strong>」即可
            </li>
            {/* <li>
                提取当前活动apk，需在手机中<strong>打开要提取的应用</strong>，点击「<strong>提取当前apk</strong>」即可
            </li> */}
            <li>
                如果无设备数据，请点击「刷新设备」
            </li>
        </ul>
    </fieldset>;
});

export default ApkTip;
