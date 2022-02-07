import { AnyAction } from 'redux';
import { CaseAddState } from '.';

export default {
    setSaving(state: CaseAddState, { payload }: AnyAction) {
        state.saving = payload;
        return state;
    },
    setOfficerList(state: CaseAddState, { payload }: AnyAction) {
        state.officerList = payload;
        return state;
    }
}
