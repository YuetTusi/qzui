import fs from 'fs';
import FtpClient from 'ftp';
import { helper } from './helper';

const conf = helper.readConf();

/**
 * 回调类型
 */
type CallbackFunc = (err: Error | null, done: boolean, progress: number) => void;

/**
 * 向FTP服务器上传文件
 * @param {string} filePath 文件路径
 * @param {string} destPath 目的地路径
 * @param {string} callback 回调 function(err,done,progress) 第3参数为上传进度
 */
function upload(filePath: string, destPath = '/', callback?: CallbackFunc) {

    if (!filePath) {
        throw new TypeError('上传文件无效');
    }

    let client = new FtpClient();
    let total = 0;
    let { size } = fs.statSync(filePath);
    let stream = fs.createReadStream(filePath);

    client.on('ready', () => {
        stream.on('data', (chunk) => {
            total += chunk.length;
            if (callback) {
                let progress = Math.round(total / size * 100);
                if (progress !== (upload as any).prevProgress) {
                    callback(null, false, progress);
                }
                (upload as any).prevProgress = progress;
            }
        });
        client.put(stream, destPath, (err) => {
            if (err) {
                if (callback) callback(err, false, 0);
            } else {
                if (callback) callback(null, true, 100);
            }
            client.end();
        });
    });

    //替换为真实的环境
    client.connect({
        host: conf.ftpServer,
        user: conf.ftpUser,
        password: conf.ftpPassword
    });
}

(upload as any).prevProgress = null;

export { upload };