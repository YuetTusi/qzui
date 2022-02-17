import { basename, join } from 'path';
import { readFile, readdir } from 'fs/promises';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Modal from 'antd/lib/modal';
import log from '@utils/log';
import { InvalidOAID } from '@utils/regex';
import { helper } from '@utils/helper';
import { useMount } from '@src/hooks';
import { StateTree } from '@src/type/model';
import { send } from '@src/service/tcpServer';
import Mask from '@src/components/Mask';
import Title from '@src/components/title';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import DeviceDesc from './DeviceDesc';
import ButtonList from './ButtonList';
import InstallTab from './InstallTab';
import { TrailProp } from './prop';
import './Trail.less';

const queryTimeout = 30; //查询超时时间
const { Trace } = SocketType;

/**
 * 查询最近一次JSON文件
 * @param phonePath 设备目录
 * @param value (IMEI/OAID)值
 * @return 存在返回文件名，否则返回Promise<undefined>
 */
const getPrevJson = async (phonePath: string, value: string) => {
	try {
		const dir = await readdir(join(phonePath, 'AppQuery', value));
		if (dir.length > 0) {
			const [target] = dir.sort((m, n) => n.localeCompare(m)); //按文件名倒序，取最近的文件
			return target;
		} else {
			return undefined;
		}
	} catch (error) {
		console.log(error.message);
		return undefined;
	}
};

const toButtonList = (imei: string[], oaid: string) => {
	const buttons: Array<{ name: string; value: string; type: 'IMEI' | 'OAID' }> = [];

	if (!helper.isNullOrUndefined(imei)) {
		for (let i = 0; i < imei.length; i++) {
			if (!helper.isNullOrUndefinedOrEmptyString(imei[i])) {
				buttons.push({
					name: `IMEI（${imei[i]}）`,
					value: imei[i],
					type: 'IMEI'
				});
			}
		}
	}

	if (!helper.isNullOrUndefinedOrEmptyString(oaid) && !InvalidOAID.test(oaid)) {
		buttons.push({
			name: `OAID（${oaid}）`,
			value: oaid,
			type: 'OAID'
		});
	}

	return buttons;
};

/**
 * 应用痕迹查询页
 */
const Trail: FC<TrailProp> = ({ dispatch, match, location, trail }) => {
	let casePageIndex = useRef<number>(1); //案件表页号
	let devicePageIndex = useRef<number>(1); //设备表页号

	const [imei, setImei] = useState<string[]>([]);
	const [oaid, setOaid] = useState<string>('');
	const queryValue = useRef<string>(); //当前查询的值（因为一次只能查一个，后台反馈结果后使用此值读取JSON展示数据）

	useMount(() => {
		const params = new URLSearchParams(location.search);
		const cp = params.get('cp');
		const dp = params.get('dp');

		casePageIndex.current = Number(cp); //记住案件表页码
		devicePageIndex.current = Number(dp); //记住设备表页码
	});

	useMount(() =>
		dispatch({
			type: 'trail/queryDeviceAndCaseById',
			payload: match.params.did
		})
	);

	useEffect(() => {
		const { deviceData } = trail;
		dispatch({ type: 'trail/setLoading', payload: true });
		(async () => {
			try {
				if (deviceData !== null) {
					const fetchDetailString: string = await readFile(
						join(deviceData.phonePath!, 'Data/fetch_detail.json'),
						{ encoding: 'utf8' }
					);
					const {
						device: { imei, oaid }
					} = JSON.parse(fetchDetailString);
					setImei(imei);
					setOaid(oaid);
				}
			} catch (error) {
				log.error(`查询设备失败@view/record/Trail/Trail.tsx: ${error.message}`);
			} finally {
				dispatch({ type: 'trail/setLoading', payload: false });
			}
		})();
	}, [trail.deviceData]);

	/**
	 * 查询Search
	 * @param value 值
	 * @param type 类型
	 */
	const onSearch = async (value: string, type: 'IMEI' | 'OAID') => {
		queryValue.current = value;

		const prevJson = await getPrevJson(trail.deviceData?.phonePath ?? '', value);

		if (prevJson) {
			const prevTime = moment
				.unix(Number(basename(prevJson, '.json')))
				.format('YYYY-MM-DD HH:mm:ss');
			Modal.confirm({
				onOk() {
					dispatch({ type: 'trail/setLoading', payload: true });
					send(Trace, {
						type: Trace,
						cmd: CommandType.AppRec,
						msg: {
							deviceId: trail.deviceData?.id ?? '',
							phonePath: trail.deviceData?.phonePath ?? '',
							value,
							type,
							timeout: queryTimeout
						}
					});
					setTimeout(
						() => dispatch({ type: 'trail/setLoading', payload: false }),
						(queryTimeout + 30) * 1000
					);
				},
				onCancel() {
					dispatch({ type: 'trail/setLoading', payload: true });
					dispatch({
						type: 'trail/readHistoryAppJson',
						payload: join(
							trail.deviceData?.phonePath ?? '',
							'AppQuery',
							value,
							prevJson
						)
					});
				},
				content: (
					<p>
						<div>
							本次操作将<strong style={{ color: '#e90000' }}>使用1次</strong>查询，
						</div>

						<div>
							可展示
							<strong style={{ color: '#e90000' }}>{prevTime}</strong>
							历史数据，请选择
						</div>
					</p>
				),
				title: '查询确认',
				okText: '查询',
				cancelText: '查看历史'
			});
		} else {
			Modal.confirm({
				onOk() {
					dispatch({ type: 'trail/setLoading', payload: true });
					send(Trace, {
						type: Trace,
						cmd: CommandType.AppRec,
						msg: {
							deviceId: trail.deviceData?.id ?? '',
							phonePath: trail.deviceData?.phonePath ?? '',
							value,
							type,
							timeout: queryTimeout
						}
					});
					setTimeout(
						() => dispatch({ type: 'trail/setLoading', payload: false }),
						(queryTimeout + 30) * 1000
					);
				},
				content: (
					<div>
						本次操作将<strong style={{ color: '#e90000' }}>使用1次</strong>
						查询，确认吗？
					</div>
				),
				title: '查询确认',
				okText: '是',
				cancelText: '否'
			});
		}
	};

	return (
		<div className="trail-root">
			<Title
				onReturn={() => {
					const { cid } = match.params;
					const url = `/record?cid=${cid}&cp=${casePageIndex.current}&dp=${devicePageIndex.current}`;
					dispatch(routerRedux.push(url));
				}}
				returnText="返回">
				云点验
			</Title>
			<div className="scroll-container">
				<div className="panel">
					<div className="sort-root">
						<div className="sort">
							<DeviceDesc caseData={trail.caseData} deviceData={trail.deviceData} />
						</div>
						<div className="sort">
							<div>
								<ButtonList
									buttonList={toButtonList(imei, oaid)}
									onSearch={onSearch}
								/>
							</div>
							<hr />
							<InstallTab installData={trail.installData} />
						</div>
					</div>
				</div>
			</div>
			<Mask show={trail.loading} />
		</div>
	);
};

export default connect((state: StateTree) => {
	return { trail: state.trail };
})(Trail);
