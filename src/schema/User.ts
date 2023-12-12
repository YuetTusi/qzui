import { BaseEntity } from './db/BaseEntity';

/**
 * 密码有效天数（天）
 */
const PasswordEffectDays = 7;

/**
 * 锁定时长（分钟）
 */
const LockTime = 10

/**
 * 用户
 */
class User extends BaseEntity {

    /**
     * 用户名
     */
    userName: string = ''
    /**
     * 密码
     */
    password: string = ''
    /**
     * 是否锁定
     */
    isLock: boolean = false
    /**
     * 最近一次密码修改时间
     */
    modifyTime: Date = new Date()
    /**
     * 锁定时间
     */
    lockTime: Date = new Date()
}

export { User, PasswordEffectDays, LockTime };