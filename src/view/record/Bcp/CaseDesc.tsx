import React, { FC, memo } from 'react';
import moment from 'moment';
import Empty from 'antd/lib/empty';
import Descriptions from 'antd/lib/descriptions';
import CCaseInfo from '@src/schema/CCaseInfo';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { helper } from '@utils/helper';

const { caseText, devText } = helper.readConf();

interface Prop {
	/**
	 * 案件数据
	 */
	caseData: CCaseInfo;
	/**
	 * 手机数据
	 */
	deviceData?: DeviceType;
}

const { Item } = Descriptions;

/**
 * 案件展示组件
 */
const CaseDesc: FC<Prop> = ({ caseData, deviceData }) => {
	if (helper.isNullOrUndefined(caseData)) {
		return (
			<div className="sort">
				<Empty description={`暂未读取到${caseText ?? '案件'}数据`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	} else {
		return (
			<div className="sort">
				<div className="case-info">
					<Descriptions bordered={true} size="small">
						<Item label={`所属${caseText ?? '案件'}`} span={3}>
							<span>{caseData.m_strCaseName.split('_')[0]}</span>
						</Item>
						<Item label={`备用${caseText ?? '案件'}名称`} span={3}>
							<span>{caseData.spareName ?? ''}</span>
						</Item>
						<Item label={`${devText ?? '手机'}名称`}>
							<span>
								{deviceData?.mobileName
									? deviceData?.mobileName!.split('_')[0]
									: ''}
							</span>
						</Item>
						<Item label={`${devText ?? '手机'}持有人`}>
							<span>{deviceData?.mobileHolder}</span>
						</Item>
						<Item label={`${devText ?? '手机'}编号`}>{deviceData?.mobileNo}</Item>
						<Item label="取证时间">
							{moment(deviceData?.fetchTime).format('YYYY-MM-DD HH:mm:ss')}
						</Item>
						<Item label="备注">{deviceData?.note}</Item>
					</Descriptions>
				</div>
			</div>
		);
	}
};

export default memo(CaseDesc);
