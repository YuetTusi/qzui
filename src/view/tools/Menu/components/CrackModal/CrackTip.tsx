import React, { FC, memo } from 'react';
import { CrackTypes } from '@src/schema/CrackTypes';

interface Prop {
	/**
	 * 破解类型
	 */
	type: CrackTypes;
}

/**
 * 提示文案
 */
const CrackTip: FC<Prop> = (props) => {
	const { type } = props;

	switch (type) {
		case CrackTypes.VivoAppLock:
			return (
				<fieldset className="tip-msg">
					<legend>应用锁破解提示</legend>
					<ul>
						<li>该功能只支持部分VIVO手机</li>
						<li>
							VIVO手机破解后可恢复，手机接入后，必须勾选一律允许使用这台计算机进行调试，
							取证后接入手机进行恢复，否则系统设置无法打开
						</li>
					</ul>
				</fieldset>
			);
		case CrackTypes.OppoAppLock:
		case CrackTypes.OppoMoveLock:
			return (
				<fieldset className="tip-msg">
					<legend>应用锁破解提示</legend>
					<ul>
						<li>该功能只支持部分OPPO手机</li>
						<li>OPPO手机应用锁破解后无法恢复，部分手机可能导致系统设置无法打开</li>
					</ul>
				</fieldset>
			);
	}
};

export default memo(CrackTip);
