import groupBy from 'lodash/groupBy';
// import debounce from 'lodash/debounce';
import React, { FC, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { TooltipComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import Empty from 'antd/lib/empty';
import Tag from 'antd/lib/tag';
import { helper } from '@utils/helper';
import { InstallApp } from '@src/schema/InstallApp';
import { AppStatusChartProp } from './prop';

echarts.use([
	TooltipComponent,
	BarChart,
	CanvasRenderer,
	LabelLayout,
	GridComponent,
	DataZoomComponent
]);

let chart: echarts.ECharts | null = null;

/**
 * 将状态数据转为数组格式
 */
const combine = (data: InstallApp | null) => {
	if (helper.isNullOrUndefined(data)) {
		return [];
	}

	const { changePkgList, changePkgStatusList, changePkgTimeList } = data!;

	if (helper.isNullOrUndefined(changePkgList) || changePkgList.trim() === '') {
		return [];
	}

	const pkg: string[] = (changePkgList ?? '').split(',');
	const status: string[] = (changePkgStatusList ?? '').split(',');
	const time: string[] = (changePkgTimeList ?? '').split(',');

	return pkg.map((item, index) => ({
		pkg: item,
		status: status[index] ?? '',
		time: time[index] ?? ''
	}));
};

const total = (
	data: {
		pkg: string;
		status: string;
		time: string;
	}[]
): [string[], number[]] => {
	const g = groupBy(data, 'time'); //按time分组
	let xAxis: string[] = [];
	let yAxis: number[] = [];
	for (const [k, v] of Object.entries(g)) {
		xAxis.push(k);
		yAxis.push(v.length);
	}
	return [xAxis, yAxis]; //返回需解构出x与y轴数据
};

/**
 * 应用安装/卸载统计图
 */
const AppStatusChart: FC<AppStatusChartProp> = ({ data }) => {
	const [appTime, setAppTime] = useState<string>(''); //当前分类
	const [detailList, setDetailList] = useState<
		{
			pkg: string;
			status: string;
			time: string;
		}[]
	>([]); //当前展示列表

	useEffect(() => {
		let $target = document.getElementById('bar-root');
		if ($target !== null && !helper.isNullOrUndefined(data)) {
			const arr = combine(data);
			const [x, y] = total(arr);
			chart = echarts.init($target);
			chart.on('click', (event) => {
				const { name } = event;
				setAppTime(name);
				setDetailList(arr.filter((item) => item.time === name));
			});
			chart.setOption({
				tooltip: {
					trigger: 'item',
					formatter: '{b} 应用变化数量：<b>{c}</b>'
				},
				dataZoom: {
					show: true,
					showDetail: false,
					type: 'slider',
					start: 0,
					end: 50
				},
				xAxis: {
					type: 'category',
					// axisLabel: { rotate: 30 },
					data: x
					// data: [
					// 	'20210101 12:00:00',
					// 	'20210101 12:00:01',
					// 	'20210101 12:00:02',
					// 	'20210101 12:00:03',
					// 	'20210101 12:00:04',
					// 	'20210101 12:00:05',
					// 	'20210101 12:00:06',
					// 	'20210101 12:00:07',
					// 	'20210101 12:00:08',
					// 	'20210101 12:00:08'
					// ]
				},
				yAxis: {
					type: 'value'
				},
				series: [
					{
						data: y,
						// data: [3, 5, 7, 2, 6, 2, 6, 1, 9, 4],
						type: 'bar',
						barWidth: 20
					}
				]
			});
		}
	}, [data]);

	const renderLi = () => {
		if (detailList.length === 0) {
			return <Empty description="暂无统计数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
		} else {
			return detailList.map(({ pkg, status }) => (
				<li key={pkg}>
					<Tag color={status === '-1' ? 'red' : 'green'}>
						{status === '-1' ? '卸载' : '安装'}
					</Tag>
					<span>{`${pkg}`}</span>
				</li>
			));
		}
	};

	return (
		<div className="install-app-chart-root">
			<div id="bar-root" className="chart-box"></div>

			<div className="list-box">
				<div className="list-panel">
					<div className="caption">{`应用列表 ${appTime}`}</div>
					<div className="list">{renderLi()}</div>
				</div>
			</div>
		</div>
	);
};

export default AppStatusChart;
