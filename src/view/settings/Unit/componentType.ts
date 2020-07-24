import { FormComponentProps } from "antd/lib/form";

interface Prop extends FormComponentProps {
}

interface State {
    selectedRowKeys: string[] | number[];
    currentPcsName: string | null;
    currentPcsCode: string | null;
    data: any[];
    total: number;
    current: number;
    loading: boolean;
}

/**
 * 数据库记录类型
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