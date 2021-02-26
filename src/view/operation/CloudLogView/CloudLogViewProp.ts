import { FormComponentProps } from 'antd/lib/form';
import { StoreComponent } from "@src/type/model";
import { CloudLogStoreState } from '@src/model/operation/CloudLog/CloudLog';
import { Moment } from 'moment';

interface Prop extends StoreComponent, FormComponentProps {
    cloudLog: CloudLogStoreState;
}

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