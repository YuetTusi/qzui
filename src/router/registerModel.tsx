import { Model, DvaInstance } from "dva";

interface ICache {
    [namespace: string]: number;
}

//已经注册model
const modelCache: ICache = {};

/**
 * @description 手动注册dva模型
 * @param app dva实例
 * @param model 模型对象
 */
function registerModel(app: DvaInstance, model: Model): void {
    if (!modelCache[model.namespace]) {
        app.model(model);
        modelCache[model.namespace] = 1;
    }
}

export { registerModel };


