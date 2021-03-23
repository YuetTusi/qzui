import { StoreData } from '@src/model/tools/Menu/ImportDataModal';
import { ImportTypes } from '@src/schema/ImportType';
import { StoreComponent } from '@src/type/model';

/**
 * 属性
 */
interface Prop extends StoreComponent {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 导入类型
     */
    type: ImportTypes,
    /**
     * 取消回调
     */
    cancelHandle?: () => void,
    /**
     * 仓库对象
     */
    importDataModal?: StoreData
}

export { Prop };