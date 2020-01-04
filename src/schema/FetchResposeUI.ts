/**
 * 用户采集响应码
 */
enum FetchResposeUI {
    /**
     * 采集完成
     */
    FETCH_FINISHED = 1,
    /**
     * 提示用户动手操作 备份相关流程
     */
    FETCH_OPERATE,
    DEV_CHANGED,
    /**
     * 打开USB调试模式
     */
    OPEN_USB_DEBUG_MOD = 0x10000,
    /**
     * 关闭打开USB调试提示窗口
     */
    USB_DEBUG_MOD_CLOSE,
    /**
     * 提示用户确认安装TZSafe.apk
     */
    INSTALL_TZSAFE_CONFIRM,
    /**
     * 用户确认安装TZSafe.apk OK
     */
    INSTALL_TZSAFE_CLOSE,
    /**
     * 提示用户确认TZSafe获取相应的权限
     */
    TZSAFE_PERMISSION_CONFIRM,
    /**
     * TZSafe获取相应权限
     */
    TZSAFE_PERMISSION_CLOSE,
    /**
     * 降级备份提示窗口
     */
    DOWNGRADE_BACKUP,
    /**
     * 关闭降级备份提示窗口
     */
    DOWNGRADE_BACKUP_CLOSE,
    /**
     * 三星备份授权提示
     */
    SAMSUNG_BACKUP_PERMISSION_CONFIRM,
    /**
     * 关闭三星备份授权提示窗口
     */
    SAMSUNG_BACKUP_PERMISSION_CLOSE,
    /**
     * OPPO采集用户确认
     */
    OPPO_FETCH_CONFIRM,
    FETCH_COMMON_INFO = 0x20000,
    FETCH_WARNING_INFO,
    FETCH_ERROR_INFO
};

export { FetchResposeUI };
export default FetchResposeUI;