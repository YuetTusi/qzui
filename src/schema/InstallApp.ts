/**
 * 安装应用数据（对应一个手机号）
 */
interface InstallApp {
    /**
     * IMEI
     */
    ieid: string | null,
    /**
     * 手机号
     */
    pid: string | null,
    /**
     * IMSI
     */
    isid: string | null,
    /**
     * OAID
     */
    oiid: string | null,
    /**
     * 在装应用列表
     */
    appList: string,
    /**
     * 最新安装/卸载的时间
     */
    lastUpdateTimeList: string,
    /**
     * 应用包列表
     */
    apppkgList: string,
    /**
     * 应用分类
     */
    cateNameList: string,
    /**
     * 包名列表
     */
    appNameList: string,
    /**
     * 30天内最近活跃时间
     */
    lastActiveTime30List: string,
    /**
     * 30天内活跃数
     */
    activeDay30List: string,
    /**
     * 变化更新的APP
     */
    changePkgList: string,
    /**
     * 变化更新的APP 对应状态 (-1：卸载)
     */
    changePkgStatusList: string,
    /**
     * 变化更新的APP 状态变化时间，到秒
     */
    changePkgTimeList: string,
    /**
     * 型号
     */
    model: string,
    /**
     * 卸载包名列表
     */
    unstallApppkgList: string,
    /**
     * 卸载应用名列表
     */
    unstallAppNameList: string,
    /**
     * 卸载应用分类列表
     */
    unstallCateNameList: string,
    /**
     * 卸载应用时间
     */
    unstallAppStatusDayList: string
}

export { InstallApp };