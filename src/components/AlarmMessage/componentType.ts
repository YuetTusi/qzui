import { StoreComponent } from '@src/type/model';
import { DashboardStore } from '@src/model/dashboard';

interface Prop extends StoreComponent {
    /**
     * 仓库State
     */
    dashboard: DashboardStore;
}

/**
 * 全局消息Entity
 */
class AlarmMessageInfo {
    /**
     * 消息id（唯一id）
     */
    id: string;
    /**
     * 消息内容
     */
    msg: string

    constructor({ id, msg }: Record<string, string>) {
        this.id = id ?? '';
        this.msg = msg ?? '';
    }
}

export { Prop, AlarmMessageInfo };