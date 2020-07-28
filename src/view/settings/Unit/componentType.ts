import { FormComponentProps } from "antd/lib/form";

/**
 * 属性
 */
interface Prop extends FormComponentProps { }

/**
 * 状态
 */
interface State {
    /**
     * 表格行选中key
     */
    selectedRowKeys: string[] | number[];
    /**
     * 当前显示的采集单位名
     */
    currentPcsName: string | null;
    /**
     * 当前显示的采集单位编号
     */
    currentPcsCode: string | null;
    /**
     * 表格数据
     */
    data: UnitRecord[];
    /**
     * 总记录数（当前查询条件）
     */
    total: number;
    /**
     * 页号
     */
    current: number;
    /**
     * 分页尺寸
     */
    pageSize: number;
    /**
     * 读取中
     */
    loading: boolean;
}

/**
 * 数据库记录
 */
interface UnitRecord {
    /**
     *  单位名称
     */
    PcsName: string;
    /**
     * 单位编号
     */
    PcsCode: string;
}

export { Prop, State, UnitRecord };