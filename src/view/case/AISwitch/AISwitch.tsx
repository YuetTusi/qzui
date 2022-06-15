import chunk from 'lodash/chunk';
import { join } from 'path';
import React, { FC, useEffect } from 'react';
import { connect } from 'dva';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Switch from 'antd/lib/switch';
import Tooltip from 'antd/lib/tooltip';
import { helper } from '@utils/helper';
import { StateTree } from '@src/type/model';
import { Predict, AiSwitchProp } from './prop';

const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';

/**
 * AI分析开关组件
 */
const AiSwitch: FC<AiSwitchProp> = ({ casePath, aiSwitch, dispatch }) => {

    const { data } = aiSwitch!;

    useEffect(() => {
        const tempAt = isDev
            ? join(cwd, './data/predict.json')
            : join(cwd, './resources/config/predict.json'); //模版路径
        (async () => {
            try {
                if (casePath === undefined) {
                    //无案件目录，是新增，读模版
                    const next: Predict[] = await helper.readJSONFile(tempAt);
                    dispatch({ type: 'aiSwitch/setData', payload: next });
                } else {
                    const aiConfigAt = join(casePath, './predict.json'); //当前案件AI路径
                    const exist = await helper.existFile(aiConfigAt);
                    if (exist) {
                        //案件下存在，读取案件下的predict.json
                        const next: Predict[] = await helper.readJSONFile(aiConfigAt);
                        dispatch({ type: 'aiSwitch/setData', payload: next });
                    } else {
                        //不存在，读取模版
                        const next: Predict[] = await helper.readJSONFile(tempAt);
                        dispatch({ type: 'aiSwitch/setData', payload: next });
                    }
                }
            } catch (error) {
                console.warn(`读取predict.json失败, @view/case/AISwitch:${error.message}`);
                dispatch({ type: 'aiSwitch/setData', payload: [] });
            }
        })();
    }, [casePath]);

    useEffect(() => {
        return () => {
            dispatch({ type: 'aiSwitch/setData', payload: [] });
        }
    }, []);

    /**
     * AI开关Change
     * @param checked 选中
     * @param type AI类型
     */
    const onSwitchChange = (checked: boolean, type: string) => {
        const next = data.map((item) => {

            if (item.type === type) {
                return { ...item, use: checked };
            } else {
                return item;
            }
        })
        dispatch({ type: 'aiSwitch/setData', payload: next });
    }

    const renderSwitch = () => {

        if (data.length === 0) {
            return null;
        }
        const rows = chunk(data, 6);
        return rows.map((row, i) => <Row style={{ padding: '16px 0' }} key={`AIROW_${i}`}>
            {
                row.map((col, j) => {
                    if (col.hide === false) {
                        return helper.isNullOrUndefinedOrEmptyString(col.tips)
                            ? <Col span={4} key={`AICOL_${j}`}>
                                <label>{col.title}：</label>
                                <Switch
                                    onChange={(checked: boolean) => onSwitchChange(checked, col.type)}
                                    checked={col.use}
                                    size="small" />
                            </Col>
                            : <Col span={4} key={`AICOL_${j}`}>
                                <Tooltip title={col.tips}>
                                    <label>{col.title}：</label>
                                    <Switch
                                        onChange={(checked: boolean) => onSwitchChange(checked, col.type)}
                                        checked={col.use}
                                        size="small" />
                                </Tooltip>
                            </Col>
                    }
                })
            }
        </Row>);
    };

    return <>
        {renderSwitch()}
    </>
};

export { Predict };
export default connect((state: StateTree) => ({ aiSwitch: state.aiSwitch }))(AiSwitch);