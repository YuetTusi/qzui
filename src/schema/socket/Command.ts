/**
 * 命令
 */
enum CommandType {
    /**
     * Socket连入
     */
    Connect = 'connect',
    /**
     * Socket断开
     */
    Disconnect = 'disconnect',
    /**
     * 设备连入
     */
    DeviceIn = 'device_in',
    /**
     * 设备状态发生变化
     */
    DeviceChange = 'device_change',
    /**
     * 设备移除
     */
    DeviceOut = 'device_out',
    /**
     * 开始采集
     */
    StartFetch = 'start_fetch',
    /**
     * 停止采集
     */
    StopFetch = 'stop_fetch',
    /**
     * 开始解析
     */
    StartParse = 'start_parse',
    /**
     * Socket连接成功
     */
    ConnectOK = 'connect_ok',
    /**
     * 用户警告提示
     */
    UserAlert = 'user_alert',
    /**
     * 采集进度消息
     */
    FetchProgress = 'fetch_progress',
    /**
     * 用户消息提示
     */
    TipMsg = 'tip_msg',
    /**
     * 消息提示回馈结果
     */
    TipReply = 'tip_reply',
    /**
     * 清除消息
     */
    TipClear = 'tip_clear',
    /**
     * 解析详情
     */
    ParseCurinfo = 'parse_curinfo',
    /**
     * 解析结束
     */
    ParseEnd = 'parse_end',
    /**
     * 导入第三方数据
     */
    ImportDevice = 'import_device',
    /**
     * 导入第三方数据失败
     */
    ImportErr = 'import_err',
    /**
     * 提示用户输入密码
     */
    BackDatapass = 'back_datapass',
    /**
     * 用户确认密码反馈
     */
    ConfirmDatapass = 'confirm_datapass',
    /**
     * 设置多用户/隐私空间消息
     */
    ExtraMsg = 'extra_msg',
    /**
     * 接收警综平台数据
     */
    Platform = 'platform'
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