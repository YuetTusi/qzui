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
    ConnectOK = 'connect_ok'
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
    Parse = 'parse'
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
    msg?: T;
}

export { Command, CommandType, SocketType };

export default CommandType;