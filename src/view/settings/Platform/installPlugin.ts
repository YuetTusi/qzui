import { execFile } from 'child_process';

/**
 * 调用批处理安装IE插件
 * @param pluginPath 批处理文件位置
 */
export function installPlugin(pluginPath: string) {
    return new Promise<void>((resolve, reject) => {
        execFile(
            pluginPath,
            [],
            {
                windowsHide: false
            },
            (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(undefined);
                }
            }
        );
    });
}