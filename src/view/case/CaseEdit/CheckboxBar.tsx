import React, { FC } from 'react';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Tooltip from 'antd/lib/tooltip';
import Form from 'antd/lib/form';
import Checkbox from 'antd/lib/checkbox';
import { helper } from '@utils/helper';
import { EditFormProp } from './EditForm';

const config = helper.readConf();
const { Item } = Form;

/**
 * 功能Checkbox行（根据conf配置文件来隐藏部分功能）
 */
const CheckboxBar: FC<EditFormProp> = (props) => {
	const { context } = props;
	const { sdCard, hasReport, m_bIsAutoParse, generateBcp, isDel, isAi } = props.data;

	let dom: JSX.Element[] = [
		<Col span={1}>
			<Checkbox onChange={context.sdCardChange} checked={sdCard} />
		</Col>,
		<Col span={3}>
			<span>生成报告：</span>
			<Checkbox onChange={context.hasReportChange} checked={hasReport} />
		</Col>,
		<Col span={3}>
			<span>自动{config.parseText ?? '解析'}：</span>
			<Tooltip title={`勾选后, ${config.fetchText ?? '取证'}完成将自动${config.parseText ?? '解析'}应用数据`}>
				<Checkbox onChange={context.autoParseChange} checked={m_bIsAutoParse} />
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
					disabled={!m_bIsAutoParse}
				/>
			</Col>
		]);
	}

	dom = dom.concat([
		<Col span={3}>
			<span>删除原数据：</span>
			<Tooltip title={`勾选后, ${config.parseText ?? '解析'}完成将删除原始数据`}>
				<Checkbox onChange={context.isDelChange} checked={isDel} />
			</Tooltip>
		</Col>
	]);

	if (config.useAi) {
		dom = dom.concat([
			<Col span={3}>
				<span>AI分析：</span>
				<Checkbox onChange={context.isAiChange} checked={isAi} />
			</Col>
		]);
	}

	return (
		<Item label="拉取SD卡">
			<Row>{...dom}</Row>
		</Item>
	);
};

export default CheckboxBar;
