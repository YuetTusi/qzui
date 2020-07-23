import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { StoreData } from "@src/model/operation/FetchLog/FetchLog";
import FetchRecord from "@src/schema/socket/FetchRecord";

/**
 * 属性
 */
export interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库对象
     */
    fetchLog: StoreData;
}

/**
 * 状态
 */
export interface State {
    /**
     * 删除弹框显示
     */
    delModalVisible: boolean;
    /**
     * 采集记录框显示
     */
    recordModalVisible: boolean;
    /**
     * 当前显示的采集记录数据
     */
    record: FetchRecord[];
}

/**
 * 上下文
 */
export interface Context {
    /**
     * 显示采集记录Handle
     */
    showRecordModalHandle: (record: FetchRecord[]) => void;
    /**
     * 删除id的记录Handle
     */
    dropById: (id: string) => void;
    /**
     * 翻页Change
     */
    pageChange: (current: number, pageSize?: number) => void;
    /**
     * 是否以admin的Role来显示
     */
    isAdmin: boolean;
    /**
     * 属性
     */
    props: Prop;
    /**
     * 状态
     */
    state: State;
}