import { execFile } from 'child_process';
import log from '@utils/log';

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
                    console.log(`安装IE插件失败 ${pluginPath}`);
                    log.error(`安装IE插件失败 ${pluginPath}`);
                    reject(err);
                } else {
                    console.log(`bat调用成功 ${pluginPath}`);
                    resolve(undefined);
                }
            }
        );
    });
}