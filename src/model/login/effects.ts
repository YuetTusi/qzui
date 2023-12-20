import { join } from 'path';
import moment from 'moment';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { LocalStoreKey } from '@src/utils/localStore';
import { PasswordEffectDays, User } from '@src/schema/User';
import { ipcRenderer } from 'electron';
import { TableName } from '@src/schema/db/TableName';
import { StateTree } from '@src/type/model';
import { helper } from '@src/utils/helper';

export default {
    /**
     * 查询登录用户
     */
    *queryByNameAndPassword({ payload }: AnyAction, { call, put, select }: EffectsCommandMap) {

        const { userName, password } = payload;
        //密码锁定时间
        const lockMinutes =
            localStorage.getItem(LocalStoreKey.LockMinutes) === null
                ? 10 : Number(localStorage.getItem(LocalStoreKey.LockMinutes));
        //密码错误允许次数
        const allowCount =
            localStorage.getItem(LocalStoreKey.AllowCount) === null
                ? 5 : Number(localStorage.getItem(LocalStoreKey.AllowCount));
        //空闲超时时间
        const loginOverTime =
            localStorage.getItem(LocalStoreKey.LoginOverTime) === null
                ? 30 : Number(localStorage.getItem(LocalStoreKey.LoginOverTime));
        message.destroy();
        yield put({ type: 'setLoading', payload: true });
        try {
            const users: User[] = yield call([ipcRenderer, 'invoke'], 'db-all', TableName.Users);

            message.destroy();
            Modal.destroyAll();
            if (users.length === 0) {
                message.info('请配置新用户');
                yield put({ type: 'setRegisterUserModalVisible', payload: true });
                return;
            }
            if (users[0].userName !== userName) {
                message.warn('无此用户，请重新输入');
                return;
            }
            if (moment(new Date()).diff(moment(users[0].modifyTime), 'day') > PasswordEffectDays) {
                //# 密码时效已过
                Modal.warn({
                    title: '口令失效',
                    content: '因长时间未修改，该用户口令已超时限，请修改口令重新登录',
                    okText: '确定',
                    centered: true
                });
                return;
            }
            const leftMinute = moment().diff(users[0].lockTime, 'minute');
            if (users[0].isLock && leftMinute < lockMinutes) {
                //# 错n次在时间之内
                Modal.warn({
                    title: '用户锁定',
                    content: `请于${lockMinutes - leftMinute}分钟后重新登录`,
                    okText: '确定',
                    centered: true
                });
                return;
            }
            if (users[0].isLock && moment().diff(users[0].lockTime, 'minute') > lockMinutes) {
                //# 已超过锁定时限，将记录isLock还原为false
                yield put({ type: 'setMistake', payload: 0 });
                // const users: User[] = yield call([ipcRenderer, 'invoke'], 'db-all', TableName.Users);
                yield call(
                    [ipcRenderer, 'invoke'],
                    'db-update',
                    TableName.Users,
                    { _id: users[0]._id },
                    { $set: { isLock: false } });
            }

            if (helper.base64ToString(users[0].password) !== password) {
                const prev: number = yield select((state: StateTree) => state.login.mistake);
                if (prev + 1 >= allowCount) {
                    Modal.warn({
                        title: '用户锁定',
                        content: `因密码连续输入错误${allowCount}次，请于${lockMinutes}分钟后重新登录`,
                        okText: '确定',
                        centered: true
                    });
                    yield call(
                        [ipcRenderer, 'invoke'],
                        'db-update',
                        TableName.Users,
                        {
                            _id: users[0]._id
                        },
                        {
                            $set: {
                                isLock: true,
                                lockTime: new Date()
                            }
                        });
                } else {
                    message.warn('口令不正确，请重新输入');
                }
                yield put({ type: 'setMistake', payload: prev + 1 });
                return;
            }

            yield put({ type: 'setMistake', payload: 0 });
            yield call(
                [ipcRenderer, 'invoke'],
                'db-update',
                TableName.Users,
                { _id: users[0]._id },
                { $set: { isLock: false } }
            );

            helper.runProc(
                'monitor.exe',
                join(helper.CWD, '../tools/monitor'),
                [(loginOverTime * 60).toString(), 'http://127.0.0.1:9900/overtime']
            );
            message.success('登录成功');
            yield put(routerRedux.push('/'));
        } catch (error) {
            console.log(error);
        } finally {
            yield put({ type: 'setLoading', payload: false });
        }
    },
    /**
     * 添加/更新用户
     */
    *saveOrUpdateUser({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

        const { userName, password, isLock, modifyTime, lockTime } = payload;
        try {
            const users: User[] = yield call([ipcRenderer, 'invoke'], 'db-all', TableName.Users);
            if (users.length === 0) {
                //添加
                const entity = new User();
                entity.userName = userName;
                entity.password = helper.stringToBase64(password);
                entity.isLock = false;
                entity.modifyTime = new Date();
                entity.lockTime = new Date();
                yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.Users, entity);
                message.success('新用户配置成功，请登录');
                yield put({ type: 'setRegisterUserModalVisible', payload: false });
            } else {
                //编辑
                const entity = new User();
                entity.userName = userName;
                entity.password = password;
                entity.isLock = isLock;
                entity.modifyTime = moment(modifyTime, 'YYYY-MM-DD HH:mm:ss').toDate();
                entity.lockTime = moment(lockTime, 'YYYY-MM-DD HH:mm:ss').toDate();
                yield call(
                    [ipcRenderer, 'invoke'],
                    'db-update',
                    TableName.Users,
                    { _id: users[0]._id },
                    entity
                );
            }
        } catch (error) {
            console.log(error);
        }
    },
    /**
     * 更新密码
     */
    *updatePassword({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        message.destroy();
        try {
            const users: User[] = yield call([ipcRenderer, 'invoke'], 'db-all', TableName.Users);
            if (users.length === 0) {
                message.warn(`口令修改失败，无此用户`);
            } else {
                yield call(
                    [ipcRenderer, 'invoke'],
                    'db-update',
                    TableName.Users,
                    { _id: users[0]._id },
                    {
                        $set: {
                            password: helper.stringToBase64(payload),
                            modifyTime: new Date()
                        }
                    }
                );
                yield put({ type: 'setMistake', payload: 0 });
                message.success('口令修改成功');
            }
        } catch (error) {
            message.warn(`口令修改失败 ${error.message}`);
        }
    },
    /**
     * 初始化登录页
     * 如果users表为空，测让用户注册
     */
    *init({ }: AnyAction, { call, put }: EffectsCommandMap) {

        try {
            message.destroy();
            const data: User[] = yield call([ipcRenderer, 'invoke'], 'db-all', TableName.Users);
            if (data.length === 0) {
                message.info('请配置新用户');
                yield put({ type: 'setRegisterUserModalVisible', payload: true });
            }
        } catch (error) {
            console.log(error);
        }
    }
};