import { Model } from "dva";
import { AnyAction } from 'redux';
/**
 * 手机列表Model
 * 对应视图: view/record/PhoneList
 */
let model: Model = {
    namespace: 'phoneList',
    state: {
        phoneListData: []
    },
    reducers: {
        setPhoneListData(state: any, { payload }: AnyAction) {
            return {
                ...state,
                phoneListData: [...payload]
            }
        }
    },
    effects: {
    }
};

export default model;