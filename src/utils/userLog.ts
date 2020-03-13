import fs from 'fs';
import path from 'path';
import { helper } from './helper';


/**
 * 记录用户日志，当不存在会创建，存在则追加
 * @param logPath 日志路径（绝对路径）
 * @param content 日志内容
 * @param fileName 文件名
 */
function writeLog(logPath: string, content: string, fileName: string = 'log.txt'): Promise<boolean> {
    let template = `[${helper.getNow('YYYY-MM-DD HH:mm:ss')}] ${content}\r\n`;
    return new Promise((resolve, reject) => {
        fs.appendFile(path.join(logPath, fileName), template, (err: Error | null) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

export { writeLog };