import fs from 'fs';
import path from 'path';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { useState } from 'react';

const cwd = process.cwd();

/**
 * 读取软件序列号
 */
function useAppSerial() {

    const [appSerial, setAppSerial] = useState<string>('');
    const serialPath = path.join(cwd, '../update/__hardware__.txt');

    helper.existFile(serialPath).then(exists => {
        if (exists) {
            fs.readFile(serialPath, { encoding: 'utf8' }, (err, chunk) => {
                if (err) {
                    log.error(`序列号文件读取失败(__hardware__):${err.message}`);
                    setAppSerial('');
                } else {
                    setAppSerial(chunk);
                }
            })
        }
    }).catch(err => {
        log.error(`序列号文件读取失败(__hardware__):${err.message}`);
        setAppSerial('');
    });

    return appSerial;
}

export { useAppSerial };