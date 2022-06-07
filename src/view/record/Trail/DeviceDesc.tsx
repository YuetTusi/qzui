import moment from 'moment';
import React, { FC, memo } from 'react';
import Empty from 'antd/lib/empty';
import Descriptions from 'antd/lib/descriptions';
import { helper } from '@utils/helper';
import CCaseInfo from '@src/schema/CCaseInfo';
import { DeviceType } from '@src/schema/socket/DeviceType';

const { caseText, devText, fetchText } = helper.readConf();

interface DeviceDescProp {
	/**
	 * 案件数据
	 */
	caseData: CCaseInfo | null;
	/**
	 * 手机数据
	 */
	deviceData: DeviceType | null;
}

const { Item } = Descriptions;

/**
 * 设备展示组件
 */
const DeviceDesc: FC<DeviceDescProp> = ({ caseData, deviceData }) => {
	if (helper.isNullOrUndefined(caseData) || helper.isNullOrUndefined(deviceData)) {
		return (
			<div className="sort">
				<Empty description="暂未读取到数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	} else {
		return (
			<div className="case-info">
				<Descriptions bordered={true} size="small">
					<Item label={`所属${caseText ?? '案件'}`} span={3}>
						<span>{caseData?.m_strCaseName.split('_')[0]}</span>
					</Item>
					<Item label={`备用${caseText ?? '案件'}名称`} span={3}>
						<span>{caseData?.spareName ?? ''}</span>
					</Item>
					<Item label={`${devText ?? '手机'}名称`}>
						<span>{deviceData!.mobileName!.split('_')[0]}</span>
					</Item>
					<Item label={`${devText ?? '手机'}持有人`}>
						<span>{deviceData!.mobileHolder ?? ''}</span>
					</Item>
					<Item label={`${devText ?? '手机'}编号`}>{deviceData?.mobileNo}</Item>
					<Item label={`${fetchText ?? '取证'}时间`}>
						{moment(deviceData?.fetchTime).format('YYYY-MM-DD HH:mm:ss')}
					</Item>
					<Item label="备注" span={2}>
						{deviceData?.note}
					</Item>
				</Descriptions>
			</div>
		);
	}
};

export default memo(DeviceDesc);
