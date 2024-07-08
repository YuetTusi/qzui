import { AnyAction } from 'redux';
import { ExtractionState } from '.';

export default {
    /**
     * 更新提取方式
     * @param payload {name:string,value:string}[] 
     */
    setTypes(state: ExtractionState, { payload }: AnyAction) {
        state.types = payload;
        return state;
    }
};