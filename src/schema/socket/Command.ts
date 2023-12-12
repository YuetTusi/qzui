/**
 * Socket命令
 */
enum CommandType {
    /**
     * Socket连入（Fetch&Parse）
     */
    Connect = 'connect',
    /**
     * Socket断开（Fetch）
     */
    Disconnect = 'disconnect',
    /**
     * 设备连入（Fetch）
     */
    DeviceIn = 'device_in',
    /**
     * 设备状态发生变化（Fetch）
     */
    DeviceChange = 'device_change',
    /**
     * 设备移除（Fetch）
     */
    DeviceOut = 'device_out',
    /**
     * 开始采集（Fetch）
     */
    StartFetch = 'start_fetch',
    /**
     * 停止采集（Fetch）
     */
    StopFetch = 'stop_fetch',
    /**
     * 开始解析（Parse）
     */
    StartParse = 'start_parse',
    /**
     * Socket连接成功（Fetch）
     */
    ConnectOK = 'connect_ok',
    /**
     * 用户警告提示（Fetch）
     */
    UserAlert = 'user_alert',
    /**
     * 采集进度消息（Fetch）
     */
    FetchProgress = 'fetch_progress',
    /**
     * 采集进度百分比值（Fetch）
     */
    FetchPercent = 'fetch_percent',
    /**
     * 用户消息提示（Fetch）
     */
    TipMsg = 'tip_msg',
    /**
     * 消息提示回馈结果（Fetch）
     */
    TipReply = 'tip_reply',
    /**
     * 消息回馈联通验证码结果（Fetch）
     */
    UMagicCodeReply = 'umagic_code_reply',
    /**
     * 清除消息（Fetch）
     */
    TipClear = 'tip_clear',
    /**
     * 接收短信云取证验证码消息详情（Fetch）
     */
    SmsMsg = 'sms_msg',
    /**
     * 发送短信验证码（短信云取）（Fetch）
     */
    SmsSend = 'sms_send',
    /**
     * 图形验证码（滑块、选字验证）（Fetch）
     */
    HumanVerify = 'human_verify',
    /**
     * 图形验证码验证回馈（Fetch）
     */
    HumanReply = 'human_reply',
    /**
     * 查询破解设备列表（Fetch）
     */
    CrackQuery = 'crack_query',
    /**
     * 接收破解列表（Fetch）
     */
    CrackList = 'crack_list',
    /**
     * 接收破解消息（Fetch）
     */
    CrackMsg = 'crack_msg',
    /**
     * 开始破解设备（Fetch）
     */
    StartCrack = 'start_crack',
    /**
     * 开始恢复设备（Fetch）
     */
    StartRecover = 'start_recover',
    /**
     * 查询设备列表（Fetch）
     */
    ApkPhoneQuery = 'apkphone_query',
    /**
     * 查询安卓apk列表（Fetch）
     */
    ApkQuery = 'apk_query',
    /**
     * 接收设备列表（Fetch）
     */
    ApkPhoneList = 'apkphone_list',
    /**
     * 接收apk列表（Fetch）
     */
    ApkList = 'apk_list',
    /**
     * 接收提取apk消息（Fetch）
     */
    ApkMsg = 'apk_msg',
    /**
     * 开始提取apk（Fetch）
     */
    ApkExtract = 'apk_extract',
    /**
     * 提取当前apk（Fetch）
     */
    ActiveExtract = 'active_extract',
    /**
     * 查询安卓提权设备列表（Fetch）
     */
    AndroidAuthQuery = 'android_auth_query',
    /**
     * 接收安卓提权列表（Fetch）
     */
    AndroidAuthList = 'android_auth_list',
    /**
     * 接收安卓提权消息（Fetch）
     */
    AntroidAuthMsg = 'android_auth_msg',
    /**
     * 开始安卓提权（Fetch）
     */
    AndroidAuthPick = 'android_auth_pick',
    /**
     * 安卓解锁
     */
    AndroidUnlock = 'android_unlock',
    /**
     * 关闭安卓设置框（Fetch）
     */
    AndroidAuthClose = 'android_auth_close',
    /**
     * 截屏
     */
    DevSnapshot = 'dev_snapshot',
    /**
     * 关闭破解框（Fetch）
     */
    CloseCrack = 'close_crack',
    /**
     * 解析详情（Parse）
     */
    ParseCurinfo = 'parse_curinfo',
    /**
     * 解析结束（Parse）
     */
    ParseEnd = 'parse_end',
    /**
     * 导入第三方数据（Parse）
     */
    ImportDevice = 'import_device',
    /**
     * 导入第三方数据失败（Parse）
     */
    ImportErr = 'import_err',
    /**
     * 提示用户输入密码（Parse）
     */
    BackDatapass = 'back_datapass',
    /**
     * 用户确认密码反馈（Parse）
     */
    ConfirmDatapass = 'confirm_datapass',
    /**
     * 设置多用户/隐私空间消息（Fetch）
     */
    ExtraMsg = 'extra_msg',
    /**
     * 接收警综平台数据（Bho）
     */
    Platform = 'platform',
    /**
     * 警综平台配置更新（Parse）
     */
    PlatChange = 'plat_change',
    /**
     * 查询登录（Trace）
     */
    TraceLogin = 'login',
    /**
     * 查询登录结果（Trace）
     */
    TraceLoginResult = 'login-result',
    /**
     * 可用次数（Trace）
     */
    LimitResult = 'limit-result',
    /**
     * 查询App安装记录（Trace）
     */
    AppRec = 'app-rec',
    /**
     * 查询App安装记录结果（Trace）
     */
    AppRecResult = 'app-rec-result'
}

/**
 * Socket分类
 */
enum SocketType {
    /**
     * 采集
     */
    Fetch = 'fetch',
    /**
     * 解析
     */
    Parse = 'parse',
    /**
     * 警综平台
     */
    Bho = 'bho',
    /**
     * 痕迹记录查询
     */
    Trace = 'trace',
    /**
     * 错误
     */
    Error = 'socket_error'
}

/**
 * 命令格式
 */
interface Command<T = any> {
    /**
     * Socket类型
     */
    type: SocketType;
    /**
     * 命令
     */
    cmd: CommandType;
    /**
     * 消息参数
     */
    msg: T;
}

export { Command, CommandType, SocketType };

export default CommandType;