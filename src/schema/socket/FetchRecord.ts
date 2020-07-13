/**
 * 采集详情记录
 */
interface FetchRecord {
    /**
     * 分类（用此属性区分入库、颜色等记录）
     */
    type: any;
    /**
     * 消息
     */
    info: string;
}

export { FetchRecord };
export default FetchRecord;