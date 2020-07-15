/**
 * 采集详情记录
 */
interface FetchRecord {
    /**
     * 分类（用此属性区分入库、颜色等记录）
     */
    type: ProgressType;
    /**
     * 消息
     */
    info: string;
}

/**
 * 进度消息分类
 * Normal为一般消息，不入库（显示黑色）
 * Warning为警告消息，入库（显示红色）
 */
enum ProgressType {
    /**
     * 一般消息
     */
    Normal,
    /**
     * 警告消息
     */
    Warning
}

/**
 * Socket采集进度消息类型
 */
interface FetchProgress {
    /**
     * USB序号
     */
    usb: number;
    /**
     * 分类
     */
    type: ProgressType;
    /**
     * 消息内容
     */
    info: string;
}

export { FetchRecord, ProgressType, FetchProgress };
export default FetchRecord;