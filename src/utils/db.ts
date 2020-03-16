import sqlite3 from 'sqlite3';
import uuid from 'uuid/v4';
import path from 'path';
import config from '@src/config/ui.config.json';

const sqlite = sqlite3.verbose();
let dbPath: string = path.join(localStorage.getItem('PUBLISH_PATH')!, config.userLogDB);

// const dbpath = path.resolve(__dirname, './db/test.db');
function add(params: any[]) {
    var db = new sqlite.Database(dbPath, (err: Error | null) => {
        if (err) {
            console.log('打开DB失败');
        }
    });

    db.serialize(() => {
        db.run(`insert into 'case'(id,name) values(?,?)`, params, (err: Error) => {
            if (err) {
                console.log(err);
            }
        });
    });

    db.close();
}

export { add };
