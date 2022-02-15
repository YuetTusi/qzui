import { StoreComponent } from "@src/type/model";
import { TrailStoreState } from "@src/model/record/Display/Trail";
import { InstallApp } from "@src/schema/InstallApp";

interface InstallTabProp {
    installData: InstallApp | null;
};


interface AppStatusChartProp {
    /**
     * 数据
     */
    data: InstallApp | null
}

interface UninstallCategoryChartProp {
    /**
     * 数据
     */
    data: InstallApp | null
}


interface ButtonListProp {

    /**
     * 查询按钮
     */
    buttonList: Array<{ name: string, value: string, type: 'IMEI' | 'OAID' }>,
    /**
     * 查询
     */
    onSearch: (value: string, type: 'IMEI' | 'OAID') => void
}

interface TrailProp extends StoreComponent {
    /**
     * 仓库
     */
    trail: TrailStoreState
}

export { TrailProp, ButtonListProp, InstallTabProp, AppStatusChartProp, UninstallCategoryChartProp };