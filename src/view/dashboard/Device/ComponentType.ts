import { StoreComponent } from "@src/type/model";
import { StoreState } from '@src/model/dashboard/Init';

interface Prop extends StoreComponent {
    device: StoreState;
}

interface State {
    //显示案件输入框
    caseModalVisible: boolean;
}

export { Prop, State };