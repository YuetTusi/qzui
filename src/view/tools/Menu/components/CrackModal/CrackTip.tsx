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
				<fieldset className="tip-msg full">
					<legend>VIVO应用锁破解提示</legend>
					<div className="sub-tip">功能：</div>
					<ul>
						<li>
							VIVO手机备份或查看数据时需要密码，可先破解后采集，采集后必须进行恢复，过程中不能拔出检测设备
						</li>
						<li>
							VIVO手机破解后可恢复，手机接入后，必须勾选一律允许使用这台计算机进行调试，
							取证后接入手机进行恢复，否则系统设置无法打开
						</li>
					</ul>
					<div className="sub-tip">注意事项：</div>
					<ul>
						<li>
							连接手机时必须勾选<strong>一律允许</strong>使用这台计算机进行调试
						</li>
						<li>
							破解的手机<strong>不能在采集状态</strong>，
							<strong>破解后必须恢复</strong>
							，否则会造成检测设备设置异常，严重时无法恢复
						</li>
						<li>可联系技术人员远程操作</li>
						<li>
							恢复成功后，打开手机设置，查看是否能正常打开，如不能打开请联系技术人员，
							<strong>切勿重启手机</strong>和<strong>断开USB连接</strong>
						</li>
					</ul>
				</fieldset>
			);
		case CrackTypes.OppoAppLock:
			return (
				<fieldset className="tip-msg full">
					<legend>OPPO应用锁破解提示</legend>
					<div className="sub-tip">功能：</div>
					<ul>
						<li>
							OPPO手机备份或查看数据时需要密码，可先破解后采集，采集后必须进行恢复，过程中不能拔出检测设备
						</li>
					</ul>
					<div className="sub-tip">注意事项：</div>
					<ul>
						<li>
							连接手机时必须勾选<strong>一律允许</strong>使用这台计算机进行调试
						</li>
						<li>
							破解的手机<strong>不能在采集状态</strong>，
							<strong>破解后必须恢复</strong>
							，否则会造成检测设备设置异常，严重时无法恢复
						</li>
						<li>可联系技术人员远程操作</li>
						<li>
							恢复成功后，打开手机设置，查看是否能正常打开，如不能打开请联系技术人员，
							<strong>切勿重启手机</strong>和<strong>断开USB连接</strong>
						</li>
					</ul>
				</fieldset>
			);
		case CrackTypes.OppoMoveLock:
			return (
				<fieldset className="tip-msg full">
					<legend>OPPO隐私锁破解提示</legend>
					<div className="sub-tip">功能：</div>
					<ul>
						<li>
							OPPO搬家时需要隐私密码，可先破解后采集，采集后必须进行恢复，过程中不能拔出检测设备
						</li>
						<li>OPPO手机应用锁破解后无法恢复，部分手机可能导致系统设置无法打开</li>
					</ul>
					<div className="sub-tip">注意事项：</div>
					<ul>
						<li>
							连接手机时必须勾选<strong>一律允许</strong>使用这台计算机进行调试
						</li>
						<li>
							破解的手机<strong>不能在采集状态</strong>，
							<strong>破解后必须恢复</strong>
							，否则会造成检测设备设置异常，严重时无法恢复
						</li>
						<li>可联系技术人员远程操作</li>
						<li>
							恢复成功后，打开手机设置，查看是否能正常打开，如不能打开请联系技术人员，
							<strong>切勿重启手机</strong>和<strong>断开USB连接</strong>
						</li>
					</ul>
				</fieldset>
			);
		default:
			return null;
	}
};

export default memo(CrackTip);
