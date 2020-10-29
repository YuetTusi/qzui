import React from 'react';
import classnames from 'classnames';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Clock from '@src/components/Clock/Clock';
import FetchInfo from './FetchInfo';
import NoWrapText from '../NoWrapText/NoWrapText';
import { DataMode } from '@src/schema/DataMode';
import PhoneSystem from '@src/schema/socket/PhoneSystem';
import { helper } from '@utils/helper';
import { caseStore, LocalStoreKey } from '@src/utils/localStore';
import { Prop } from './ComponentType';

const config = helper.readConf();

/**
 * 渲染案件信息
 * @param data 组件属性
 */
const renderCaseInfo = (data: Prop | null): JSX.Element => {
	let caseName = '';
	let mobileHolder = '';
	let mobileNo = '';

	if (data !== null && caseStore.exist(data.usb!)) {
		let caseSession = caseStore.get(data.usb!);
		caseName = helper.isNullOrUndefined(caseSession.caseName)
			? ''
			: caseSession.caseName.split('_')[0];
		mobileHolder = caseSession.mobileHolder;
		mobileNo = caseSession.mobileNo;
	}
	return (
		<>
			<div className="txt">案件名称：</div>
			<div className="val">{caseName}</div>
			<div className="txt">手机持有人：</div>
			<div className="val">{mobileHolder}</div>
			{!helper.isNullOrUndefinedOrEmptyString(mobileNo) ? (
				<>
					<div className="txt">手机编号：</div>
					<div className="val">{mobileNo}</div>
				</>
			) : null}
		</>
	);
};

/**
 * 渲染手机信息
 * @param data 组件属性
 */
const renderPhoneInfo = (data: Prop) => {
	const { phoneInfo } = data;
	if (helper.isNullOrUndefined(phoneInfo)) {
		return null;
	} else {
		return phoneInfo!.map((i) => (
			<div key={helper.getKey()}>
				<label>{i.name}：</label>
				<span>{i.value}</span>
			</div>
		));
	}
};

/**
 * 渲染多用户/隐私空间消息
 * @param data 组件属性
 */
const renderExtra = (data: Prop) => {
	if (helper.isNullOrUndefined(data.extra)) {
		return (
			<div className="extra-msg">
				<span>&nbsp;</span>
			</div>
		);
	} else {
		return (
			<div className="extra-msg" title={data.extra}>
				<span>{data.extra}</span>
			</div>
		);
	}
};

/**
 * 等待状态
 */
const getDomByWaiting = (props: Prop): JSX.Element => {
	return (
		<div className="connecting">
			<div className="info">请连接USB</div>
			<div className="lstatus">
				<Icon type="usb" />
			</div>
		</div>
	);
};

/**
 * 未连接状态
 */
const getDomByNotConnect = (props: Prop): JSX.Element => {
	return (
		<div className="connected">
			<div className="phone-info">
				<div className="img">
					{/* <div className="title">正在连接...</div> */}
					<i
						className={classnames('phone-type', {
							large: config.max <= 2
						})}>
						<div className="dt">
							<NoWrapText width={90} align="center">
								{props.manufacturer}
							</NoWrapText>
						</div>
					</i>
				</div>
				<div className="details">
					<div className="outer-box">
						<div className="msg-txt">
							<div>
								<div>
									安卓设备请确认已开启<em>USB调试</em>且是<em>文件传输模式</em>
								</div>
								<div>
									苹果设备请点击<em>信任</em>此电脑
								</div>
								<div className="helper-link">
									<a onClick={() => props.userHelpHandle(PhoneSystem.Android)}>
										安卓帮助
									</a>
									<a onClick={() => props.userHelpHandle(PhoneSystem.IOS)}>
										苹果帮助
									</a>
								</div>
							</div>
						</div>
						<div className="btn">
							<Button
								type="primary"
								disabled={true}
								size={config.max <= 2 ? 'large' : 'small'}>
								设备取证
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * 已连接状态
 */
const getDomByHasConnect = (props: Prop): JSX.Element => {
	const dataMode = Number(localStorage.getItem(LocalStoreKey.DataMode));
	return (
		<div className="connected">
			{renderExtra(props)}
			<div className="phone-info">
				<div className="img">
					{/* <div className="title">已连接</div> */}
					<i
						className={classnames('phone-type', {
							large: config.max <= 2
						})}>
						<div className="dt">
							<NoWrapText width={90} align="center">
								{props.manufacturer}
							</NoWrapText>
						</div>
					</i>
				</div>
				<div className="details">
					<div className="outer-box">
						<div className="mobile-info">{renderPhoneInfo(props)}</div>
						<div className="btn">
							<Button
								type="primary"
								size={config.max <= 2 ? 'large' : 'small'}
								disabled={
									dataMode === DataMode.GuangZhou ? props.hasFetching : false
								}
								onClick={() => props.collectHandle(props)}>
								设备取证
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * 采集中状态
 */
const getDomByFetching = (props: Prop): JSX.Element => {
	const { isStopping } = props;
	return (
		<div className="fetching">
			<div className="progress">
				<div className="progress-detail">
					<FetchInfo usb={props.usb!} />
				</div>
			</div>
			{renderExtra(props)}
			<div className="phone-info">
				<div className="img">
					{/* <div className="title">正在取证...</div> */}
					<i
						className={classnames('phone-type', {
							large: config.max <= 2
						})}
						title={`型号：${props.model}\n系统：${props.system}`}>
						<div className="dt">
							<NoWrapText width={90} align="center">
								{props.manufacturer}
							</NoWrapText>
						</div>
						<div>
							<Clock usb={Number(props.usb) - 1} system={props.system!} />
						</div>
					</i>
				</div>
				<div className="details">
					<div className="outer-box">
						<div className="case-info">{renderCaseInfo(props)}</div>
						<div className="btn">
							<Button
								type="primary"
								size={config.max <= 2 ? 'large' : 'small'}
								disabled={isStopping}
								onClick={() => {
									Modal.confirm({
										title: '停止',
										content: '确定停止取证？',
										okText: '是',
										cancelText: '否',
										onOk() {
											props.stopHandle(props);
										}
									});
								}}>
								<span>{isStopping ? '停止中...' : '停止取证'}</span>
							</Button>
							<Button
								type="primary"
								size={config.max <= 2 ? 'large' : 'small'}
								onClick={() => {
									props.errorHandle(props);
								}}>
								采集历史
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * 采集完成状态
 */
const getDomByFetchEnd = (props: Prop): JSX.Element => {
	const dataMode = Number(localStorage.getItem(LocalStoreKey.DataMode));
	return (
		<div className="fetching">
			{renderExtra(props)}
			<div className="phone-info">
				<div className="img">
					{/* <div className="title">取证完成</div> */}
					<i
						className={classnames('phone-type', {
							large: config.max <= 2
						})}
						title={`型号：${props.model}\n系统：${props.system}`}>
						<div className="dt">
							<NoWrapText width={90} align="center">
								{props.manufacturer}
							</NoWrapText>
						</div>
						<div className="finished">
							<span>取证完成</span>
						</div>
						<div style={{ display: 'none' }}>
							<Clock usb={props.usb! - 1} system={props.system!} />
						</div>
					</i>
				</div>
				<div className="details">
					<div className="outer-box">
						<div className="case-info">{renderCaseInfo(props)}</div>
						<div className="btn">
							<Button
								type="primary"
								disabled={
									dataMode === DataMode.GuangZhou ? props.hasFetching : false
								}
								size={config.max <= 2 ? 'large' : 'small'}
								onClick={() => {
									props.collectHandle(props);
								}}>
								设备取证
							</Button>
							<Button
								type="primary"
								size={config.max <= 2 ? 'large' : 'small'}
								onClick={() => {
									props.errorHandle(props);
								}}>
								采集历史
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * 采集有误状态
 */
const getDomByHasError = (props: Prop): JSX.Element => {
	const dataMode = Number(localStorage.getItem(LocalStoreKey.DataMode));
	return (
		<div className="fetching">
			{renderExtra(props)}
			<div className="phone-info">
				<div className="img">
					{/* <div className="title warning">取证异常</div> */}
					<i
						className={classnames('phone-type', {
							large: config.max <= 2
						})}
						title={`型号：${props.model}\n系统：${props.system}`}>
						<div className="dt">
							<NoWrapText width={90} align="center">
								{props.manufacturer}
							</NoWrapText>
						</div>
						<div style={{ display: 'none' }}>
							<Clock usb={props.usb! - 1} system={props.system!} />
						</div>
					</i>
				</div>
				<div className="details">
					<div className="outer-box">
						<div className="case-info">{renderCaseInfo(props)}</div>
						<div className="btn">
							<Button
								disabled={
									dataMode === DataMode.GuangZhou ? props.hasFetching : false
								}
								type="primary"
								size={config.max <= 2 ? 'large' : 'small'}
								onClick={() => {
									props.collectHandle(props);
								}}>
								设备取证
							</Button>
							<Button
								type="primary"
								size={config.max <= 2 ? 'large' : 'small'}
								onClick={() => {
									props.errorHandle(props);
								}}>
								采集历史
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export {
	getDomByWaiting,
	getDomByNotConnect,
	getDomByHasConnect,
	getDomByFetching,
	getDomByFetchEnd,
	getDomByHasError
};
