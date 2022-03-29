import { AnyAction } from 'redux';
import { CaseDataState } from '.';

export default {

    setCaseData(state: CaseDataState, { payload }: AnyAction) {
        state.caseData = payload;
        return state;
    },
    setPage(state: CaseDataState, { payload }: AnyAction) {
        state.total = payload.total;
        state.current = payload.current;
        state.pageSize = payload.pageSize;
        return state;
    },
    setLoading(state: CaseDataState, { payload }: AnyAction) {
        state.loading = payload;
        return state;
    },
    setCheckCaseId(state: CaseDataState, { payload }: AnyAction) {
        state.checkCaseId = payload;
        return state;
    }
}