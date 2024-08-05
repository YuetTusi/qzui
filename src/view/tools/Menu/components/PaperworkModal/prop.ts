import { StoreComponent } from "@src/type/model";
import { PaperworkModalState } from "@src/model/tools/PaperworkModal";

export interface PaperworkModalProp extends StoreComponent {


    visible: boolean,

    confirmLoading: boolean,

    onOk: (data: Record<string, any>) => void,

    onCancel: () => void,

    paperworkModal: PaperworkModalState
}