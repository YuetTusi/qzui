import { FormComponentProps } from "antd/lib/form/Form";
import { StoreComponent } from "@src/type/model";
import { Moment } from "moment";
import { StoreData } from "@src/model/operation/ParseLog/ParseLog";


/**
 * 组件属性
 */
interface Prop extends FormComponentProps, StoreComponent {
    /**
     * 仓库数据
     */
    parseLog: StoreData;
};

/**
 * 查询表单
 */
interface FormValue {
    /**
     * 查询时间起
     */
    start?: Moment | null;
    /**
     * 查询时间止
     */
    end?: Moment | null;
}

export { Prop, FormValue };