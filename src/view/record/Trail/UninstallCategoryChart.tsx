import countBy from 'lodash/countBy';
import debounce from 'lodash/debounce';
import React, { FC, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import Empty from 'antd/lib/empty';
import { helper } from '@utils/helper';
import { InstallApp } from '@src/schema/InstallApp';
import { UninstallCategoryChartProp } from './prop';

echarts.use([
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	PieChart,
	CanvasRenderer,
	LabelLayout
]);

let chart: echarts.ECharts | null = null;

const uninstallCategoryOption: Record<string, any> = {
	tooltip: {
		trigger: 'item',
		formatter: '{b}数量：{c}<br/>占比：{d}%'
	},
	legend: false,
	series: [
		{
			name: '命中统计',
			type: 'pie',
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(54, 46, 46, 0.5)'
				}
			}
		}
	]
};

/**
 * 分类统计
 */
const categoryTotal = ({ unstallCateNameList }: InstallApp) => {
	const categoryList = (
		helper.isNullOrUndefined(unstallCateNameList) ? [] : unstallCateNameList.split(',')
	).map((item) => (item === '' ? '未知' : item));

	const nv = Object.entries(countBy(categoryList));
	let total: { value: number; name: string }[] = [];
	for (let [k, v] of nv) {
		total.push({ name: k, value: v });
	}
	return total;
};

/**
 * 将包名、应用名、分类联合成数组
 */
const combine = (data: InstallApp | null) => {
	if (data === null) {
		return [];
	}
	const { unstallCateNameList, unstallApppkgList, unstallAppNameList, unstallAppStatusDayList } =
		data;
	const category = (
		helper.isNullOrUndefined(unstallCateNameList) ? [] : unstallCateNameList.split(',')
	).map((item) => (item === '' ? '未知' : item));
	const pkg = helper.isNullOrUndefined(unstallApppkgList) ? [] : unstallApppkgList.split(',');
	const name = helper.isNullOrUndefined(unstallAppNameList) ? [] : unstallAppNameList.split(',');
	const time = helper.isNullOrUndefined(unstallAppStatusDayList)
		? []
		: unstallAppStatusDayList.split(',');
	let next: { pkg: string; name: string; category: string; time: string }[] = [];

	for (let i = 0, len = unstallAppNameList.length; i < len; i++) {
		next.push({
			name: name[i],
			pkg: pkg[i],
			category: category[i],
			time: time[i]
		});
	}

	return next;
};

/**
 * 卸载应用统计图
 */
const UninstallCategoryChart: FC<UninstallCategoryChartProp> = ({ data }) => {
	const [category, setCategory] = useState<string>(); //当前分类
	const [detailList, setDetailList] = useState<
		{ pkg: string; name: string; category: string; time: string }[]
	>([]); //当前展示列表

	useEffect(() => {
		if (!helper.isNullOrUndefined(data)) {
			const $chartRoot = document.getElementById('uninstall-category-chart');
			chart = echarts.init($chartRoot!);
			chart.on('click', (event) => {
				const { name } = event.data as any;
				onPieClick(name);
			});
			if ($chartRoot !== null) {
				uninstallCategoryOption.series[0].data = categoryTotal(data!);
				chart.setOption(uninstallCategoryOption);
			}
		}
	}, [data]);

	/**
	 * 饼图Click
	 * @param name 分类名称
	 */
	const onPieClick = debounce(
		(name: string) => {
			setCategory(name);
			setDetailList(combine(data).filter((item) => item.category === name));
		},
		400,
		{ leading: true, trailing: false }
	);

	const renderLi = (data: { pkg: string; name: string; category: string; time: string }[]) => {
		if (data.length === 0) {
			return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无统计数据" />;
		} else {
			return (
				<ul>
					{data.map(({ name, pkg, time }, i) => {
						return <li key={`K_${i}`}>{`${name}（${pkg}）${time}`}</li>;
					})}
				</ul>
			);
		}
	};

	return (
		<div className="install-app-chart-root">
			<div id="uninstall-category-chart" className="chart-box"></div>

			<div className="list-box">
				<div className="list-panel">
					<div className="caption">{category === undefined ? '应用列表' : category}</div>
					<div className="list">{renderLi(detailList)}</div>
				</div>
			</div>
		</div>
	);
};

export default UninstallCategoryChart;
