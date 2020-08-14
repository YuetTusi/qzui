import { AnyAction } from 'redux';
import { Model } from 'dva';
import { identity } from 'lodash';

/**
 * 涉案分类
 */
interface Crime {
    /**
     * 唯一标识
     */
    id: string;
    /**
     * 分类名称
     */
    sort: string;
    /**
     * 子项
     */
    children: string[];
}

/**
 * 仓库State
 */
interface CrimeState {
    crimes: Crime[];
}


let model: Model = {
    namespace: 'crime',
    state: {
        crimes: [
            {
                id: '1',
                sort: '分类1',
                children: ['1', '2', '3']
            }, {
                id: '2',
                sort: '分类2',
                children: ['a', 'b', 'c']
            }
        ]
    },
    reducers: {
        /**
         * 增加分类
         * @param {string} payload.id ID
         * @param {string} payload.sort 分类
         * @param {string[]} payload.children 子项
         */
        addSort(state: CrimeState, { payload }: AnyAction) {
            state.crimes.push(payload);
            return state;
        },
        /**
         * 更新分类名称
         * @param {string} payload.id ID
         * @param {string} payload.sort 分类名
         */
        updateSort(state: CrimeState, { payload }: AnyAction) {
            let next = state.crimes.map(i => {
                if (i.id === payload.id) {
                    i.sort = payload.sort;
                }
                return i;
            });
            state.crimes = next;
            return state;
        },
        /**
         * 删除分类
         * @param {string} payload ID
         */
        deleteSort(state: CrimeState, { payload }: AnyAction) {
            let next = state.crimes.filter(i => i.id !== payload);
            state.crimes = next;
            return state;
        },
        /**
         * 增加分类下的关键词
         * @param {string} payload.id 分类ID
         * @param {string} payload.value 关键词
         */
        addChild(state: CrimeState, { payload }: AnyAction) {
            let next = state.crimes.map(i => {
                if (i.id === payload.id) {
                    i.children.push(payload.value);
                }
                return i;
            });
            state.crimes = next;
            return state;
        },
        /**
         * 更新分类下的关键词
         * @param {string} payload.id 分类ID
         * @param {number} payload.index 数组索引
         * @param {string} payload.value 关键词
         */
        updateChild(state: CrimeState, { payload }: AnyAction) {
            let sort = state.crimes.find(i => i.id === payload.id);
            if (sort?.children[Number(payload.index)] === payload.value) {
                return state;
            } else {
                let next = state.crimes.map(i => {
                    // debugger;
                    if (i.id === payload.id && i.children[payload.index] !== payload.value) {
                        i.children[Number(payload.index)] = payload.value;
                    }
                    return i;
                });
                state.crimes = next;
                return state;
            }
        },
        /**
         * 删除分类下的关键词
         * @param {string} payload.id 分类ID
         * @param {number} payload.index 数组索引
         */
        deleteChild(state: CrimeState, { payload }: AnyAction) {
            let next = state.crimes.map(i => {
                if (i.id === payload.id) {
                    i.children.splice(payload.index, 1);
                }
                return i;
            });
            state.crimes = next;
            return state;
        }
    }
};

export { CrimeState, Crime }
export default model;