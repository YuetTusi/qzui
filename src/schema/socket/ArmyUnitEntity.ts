import { BaseEntity } from "../db/BaseEntity";

/**
 * 采集单位（部队版本使用）
 */
class ArmyUnitEntity extends BaseEntity {

    /**
    * 单位名称
    */
    unitName: string = '';
}

export { ArmyUnitEntity };