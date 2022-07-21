import path from 'path';
import querystring from 'querystring';
import { shell } from 'electron';
import React, { FC, useRef, MouseEvent } from 'react';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts/types/dist/shared';
import {
	TooltipComponent,
	GridComponent,
	ToolboxComponent,
	LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { useMount } from '@src/hooks';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import message from 'antd/lib/message';
import { StateTree, StoreComponent } from '@src/type/model';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { HitResultStoreState } from '@src/model/record/Display/HitResult';
import { helper } from '@utils/helper';
import './HitResult.less';

const appPath = process.cwd();

echarts.use([
	// TitleComponent,
	GridComponent,
	LegendComponent,
	TooltipComponent,
	ToolboxComponent,
	PieChart,
	CanvasRenderer
]);

let options: EChartsOption = {
	legend: {
		top: 'bottom'
	},
	tooltip: {
		trigger: 'item',
		formatter: '{a} <br/>{b} : {c} ({d}%)'
	},
	toolbox: {
		show: true,
		feature: {
			mark: { show: true },
			dataView: { show: false, readOnly: true },
			restore: { show: false },
			saveAsImage: { show: false }
		}
	},
	series: [
		{
			name: '命中结果汇总',
			type: 'pie',
			radius: [50, 250],
			center: ['50%', '50%'],
			roseType: 'area',
			itemStyle: {
				borderRadius: 8
			},
			data: []
		}
	]
};

interface Prop extends StoreComponent {
	/**
	 * 设备
	 */
	device: DeviceType;
	/**
	 * 仓库
	 */
	hitResult: HitResultStoreState;
}

/**
 * 命中结果页面
 */
const HitResult: FC<Prop> = ({ hitResult, dispatch, match, location }) => {
	const { did } = match.params;
	let casePageIndex = useRef<number>(1); //案件表页号
	let devicePageIndex = useRef<number>(1); //设备表页号

	useMount(() => {
		queryDevice(did);
		renderChart();
	});

	useMount(() => {
		const { search } = location;
		const { cp, dp } = querystring.parse(search.substring(1));
		casePageIndex.current = Number(cp);
		devicePageIndex.current = Number(dp);
	});

	/**
	 * 查询设备记录
	 */
	const queryDevice = (id: string) =>
		dispatch({ type: 'hitResult/queryDeviceById', payload: id });

	/**
	 * 渲染图表
	 */
	const renderChart = async () => {
		let hide = message.loading('正在读取图表数据', 0);
		const jsonPath = path.join(appPath, `./KeywordSearch/${did}.json`);
		try {
			let exist = await helper.existFile(jsonPath);
			if (exist) {
				let chartData: any = await helper.readJSONFile(jsonPath);
				let $target = document.getElementById('target');
				(options.series as any[])[0].data = (
					chartData.items as Array<{
						value: number;
					}>
				).filter((i) => i.value !== 0);
				const chart = echarts.init($target!);
				chart.setOption(options, false);
				hide();
			} else {
				message.destroy();
				message.warn('命中结果数据不存在');
			}
		} catch (error) {
			message.destroy();
			message.error('加载图表失败');
		}
	};

	const openReportClick = async (e: MouseEvent<HTMLButtonElement>) => {
		const { deviceData } = hitResult;

		if (helper.isNullOrUndefined(deviceData)) {
			message.destroy();
			message.info('手机数据不存在');
		} else {
			const treeJsonPath = path.join(
				deviceData?.phonePath!,
				'./report/public/data/tree.json'
			);
			const reportPath = path.join(deviceData?.phonePath!, './report/index.html');
			let exist = await helper.existFile(treeJsonPath);
			if (exist) {
				shell.openPath(reportPath);
			} else {
				message.destroy();
				message.info('未生成报告，请重新生成报告后进行查看');
			}
		}
	};

	return (
		<div className="hit-result-root">
			<div className="hit-bar">
				<ul>
					<li>
						<i>
							<FontAwesomeIcon icon={faPencilAlt} />
						</i>
						<span>命中结果</span>
					</li>
					<li>
						<label>手机型号</label>
						<span>{hitResult.deviceData?.model ?? ''}</span>
					</li>
					<li>
						<label>手机名称</label>
						<span>
							{helper.isNullOrUndefinedOrEmptyString(hitResult.deviceData?.mobileName)
								? ''
								: hitResult.deviceData?.mobileName!.split('_')[0]}
						</span>
					</li>
					<li>
						<label>手机持有人</label>
						<span>{hitResult.deviceData?.mobileHolder ?? ''}</span>
					</li>
					{/* <li>
						<a
							type="button"
							onClick={() => {
								const { caseId } = props.hitResult.deviceData!;
								const url = `/record?cid=${caseId}&cp=${casePageIndex.current}&dp=${devicePageIndex.current}`;
								props.dispatch(routerRedux.push(url));
							}}>
							返回
						</a>
					</li> */}
				</ul>
			</div>
			<div className="chart-scroll-panel">
				<div id="target">
					<Empty description="暂无命中结果数据" />
				</div>
				<div className="detail-button">
					<Button onClick={openReportClick} icon="profile" type="primary">
						查看详情
					</Button>
				</div>
			</div>
		</div>
	);
};

export default connect((state: StateTree) => ({ hitResult: state.hitResult }))(HitResult);
