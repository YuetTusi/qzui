import installApk from '../images/apk/apk.jpg';
import huaweiHisuite from '../images/fetch/huawei_hisuite.jpg';
import huaweiBackup from '../images/fetch/huawei_backup.jpg';
import meizuBackup from '../images/fetch/meizu_backup.jpg';
import oppoBackup from '../images/fetch/oppo_backup.jpg';
import oppoWiFi from '../images/fetch/oppo_wifi.jpg';
import vivoBackup from '../images/fetch/vivo_backup.jpg';
import miBackup from '../images/fetch/mi_backup.jpg';
import installEasyshare from '../images/apk/easy_share.jpg';
import OneplusBackup from '../images/fetch/oneplus_backup.jpg';
import GuideImage from '@src/schema/socket/GuideImage';

/**
 * 根据分类得到图片路径
 * @param type GuideImage类型
 */
export function getImages(type: GuideImage): string | null {
    switch (type) {
        case GuideImage.InstallApk:
            return installApk;
        case GuideImage.HuaweiBackup:
            return huaweiBackup;
        case GuideImage.HuaweiHisuite:
            return huaweiHisuite;
        case GuideImage.MeizuBackup:
            return meizuBackup;
        case GuideImage.OppoWifi:
            return oppoWiFi;
        case GuideImage.OppoBackup:
            return oppoBackup;
        case GuideImage.VivoBackup:
            return vivoBackup;
        case GuideImage.MiBackup:
            return miBackup;
        case GuideImage.InstallEasyshare:
            return installEasyshare;
        case GuideImage.OneplusBackup:
            return OneplusBackup;
        default:
            return null;
    }
}
