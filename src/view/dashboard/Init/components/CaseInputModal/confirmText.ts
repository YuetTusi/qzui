/**
 * 获取提示文案
 * @param type 0:隐私空间 1：应用分身
 */
export function confirmText(type: number) {
    switch (type) {
        case 0:
            return '手机存在隐私空间，推荐使用默认采集方式获取隐私空间的数据，如果不需要隐私空间数据请更换采集方式';
        case 1:
            return '手机存在分身数据，推荐使用默认采集方式获取分身的数据，如果不需要分身数据请更换采集方式';
        default:
            return '手机存在隐私空间和分身数据，推荐使用默认采集方式获取隐私空间和分身数据，如果不需要请更换采集方式';
    }
}