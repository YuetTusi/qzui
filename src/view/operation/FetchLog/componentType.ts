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
