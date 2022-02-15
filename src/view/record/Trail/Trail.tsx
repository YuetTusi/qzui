import { join } from 'path';
import { readFile } from 'fs/promises';
import React, { FC, useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
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
	const onSearch = (value: string, type: 'IMEI' | 'OAID') => {
		dispatch({ type: 'trail/setLoading', payload: true });
		queryValue.current = value;
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
				安装App查询
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
