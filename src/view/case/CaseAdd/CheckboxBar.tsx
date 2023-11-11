import React, { FC } from 'react';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Tooltip from 'antd/lib/tooltip';
import Form from 'antd/lib/form';
import Checkbox from 'antd/lib/checkbox';
import { helper } from '@src/utils/helper';
import { AddFormProp } from './AddForm';

const config = helper.readConf();
const { Item } = Form;

/**
 * 功能Checkbox行（根据conf配置文件来隐藏部分功能）
 */
const CheckboxBar: FC<AddFormProp> = (props) => {
	const { context } = props;
	const {
		analysisApp,
		sdCard,
		hasReport,
		autoParse,
		generateBcp,
		disableGenerateBcp,
		isDel,
		isAi,
		isPhotoAnalysis
	} = props.parameter;

	let dom: JSX.Element[] = [
		<Col span={1}>
			<Checkbox onChange={context.analysisAppChange} checked={analysisApp} />
		</Col>,
		<Col span={3}>
			<span>获取SD卡数据：</span>
			<Checkbox onChange={context.sdCardChange} checked={sdCard} />
		</Col>,
		<Col span={3}>
			<span>生成报告：</span>
			<Checkbox onChange={context.hasReportChange} checked={hasReport} />
		</Col>,
		<Col span={3}>
			<span>自动{config.parseText ?? '解析'}：</span>
			<Tooltip title={`勾选后, ${config.fetchText ?? '取证'}完成将自动${config.parseText ?? '解析'}应用数据`}>
				<Checkbox onChange={context.autoParseChange} checked={autoParse} />
			</Tooltip>
		</Col>
	];

	if (config.useBcp) {
		dom = dom.concat([
			<Col span={3}>
				<span>自动生成BCP：</span>
				<Checkbox
					onChange={context.generateBcpChange}
					checked={generateBcp}
					disabled={disableGenerateBcp}
				/>
			</Col>
		]);
	}

	dom = dom.concat([
		<Col span={3}>
			<span>删除本地缓存：</span>
			<Tooltip title={`${config.parseText ?? '解析'}结束自动删除缓存，可节省磁盘空间，不可再次重新${config.parseText ?? '解析'}`}>
				<Checkbox onChange={context.isDelChange} checked={isDel} />
			</Tooltip>
		</Col>,
	]);

	if (config.useAi) {
		dom = dom.concat([
			<Col span={3}>
				<span>AI分析：</span>
				<Checkbox onChange={context.isAiChange} checked={isAi} />
			</Col>
		]);
	}

	dom = dom.concat([
		<Col span={3}>
			<span>图片违规分析：</span>
			<Tooltip title="此功能为全局分析，速度较慢">
				<Checkbox onChange={context.isPhotoAnalysisChange} checked={isPhotoAnalysis} />
			</Tooltip>
		</Col>
	]);

	return (
		<Item label="获取应用数据">
			<Row>{...dom}</Row>
		</Item>
	);
};

export default CheckboxBar;
