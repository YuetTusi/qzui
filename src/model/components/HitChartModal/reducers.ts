import { AnyAction } from 'redux';
import { HitChartModalState } from '.';

export default {

    setVisible(state: HitChartModalState, { payload }: AnyAction) {

        state.visible = payload;
        return state;
    },
    setData(state: HitChartModalState, { payload }: AnyAction) {

        state.data = payload;
        return state;
    }
};