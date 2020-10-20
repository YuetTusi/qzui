import { StoreData } from '@src/model/tools/Menu/ImportDataModal';
import { StoreComponent } from '@src/type/model';

/**
 * 属性
 */
interface Prop extends StoreComponent {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 是否为加载状态
     */
    isLoading: boolean;
    /**
     * 仓库对象
     */
    importDataModal?: StoreData;
    /**
     * 保存回调
     */
    saveHandle?: (arg0: any) => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
}

/**
 * 状态
 */
interface State {
    /**
     * 是否可见
     */
    caseInputVisible: boolean;
    /**
     * 所选案件是否生成BCP
     */
    isBcp: boolean;
    /**
     * 第三方数据路径
     */
    dataPath: string;
    /**
     * 是否为加载状态
     */
    isLoading: boolean;
    /**
     * 检验员缓存记录
     */
    historyCheckerNames: string[];
}
export { Prop, State };