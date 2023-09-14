import chunk from 'lodash/chunk';
import { join } from 'path';
import React, { FC, useEffect, FocusEvent } from 'react';
import { connect } from 'dva';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import InputNumber from 'antd/lib/input-number';
import Switch from 'antd/lib/switch';
import Tooltip from 'antd/lib/tooltip';
import { helper } from '@utils/helper';
import { StateTree } from '@src/type/model';
import { Predict, AiSwitchProp, PredictComp, PredictJson } from './prop';

const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';

/**
 * AI分析开关组件
 */
const AiSwitch: FC<AiSwitchProp> = ({ casePath, aiSwitch, dispatch }) => {

    const { data, similarity, ocr } = aiSwitch!;

    useEffect(() => {
        const tempAt = isDev
            ? join(cwd, './data/predict.json')
            : join(cwd, './resources/config/predict.json'); //模版路径
        (async () => {
            try {
                if (casePath === undefined) {
                    //无案件目录，是新增，读模版
                    const next: PredictComp = await helper.readJSONFile(tempAt);
                    dispatch({ type: 'aiSwitch/setData', payload: (next as PredictJson).config });
                    dispatch({ type: 'aiSwitch/setSimilarity', payload: (next as PredictJson).similarity });
                    dispatch({ type: 'aiSwitch/setOcr', payload: (next as PredictJson).ocr });
                } else {
                    const aiConfigAt = join(casePath, './predict.json'); //当前案件AI路径
                    const exist = await helper.existFile(aiConfigAt);
                    if (exist) {
                        //案件下存在，读取案件下的predict.json
                        const next: PredictComp = await helper.readJSONFile(aiConfigAt);
                        if (Array.isArray(next)) {
                            //旧版predict.json
                            dispatch({ type: 'aiSwitch/setData', payload: next });
                            dispatch({ type: 'aiSwitch/setSimilarity', payload: 0 });
                            dispatch({ type: 'aiSwitch/setOcr', payload: false });
                        } else {
                            dispatch({ type: 'aiSwitch/setData', payload: (next as PredictJson).config });
                            dispatch({ type: 'aiSwitch/setSimilarity', payload: (next as PredictJson).similarity });
                            dispatch({ type: 'aiSwitch/setOcr', payload: (next as PredictJson).ocr });
                        }
                    } else {
                        //不存在，读取模版
                        const next: PredictComp = await helper.readJSONFile(tempAt);
                        dispatch({ type: 'aiSwitch/setData', payload: (next as PredictJson).config });
                        dispatch({ type: 'aiSwitch/setSimilarity', payload: (next as PredictJson).similarity });
                        dispatch({ type: 'aiSwitch/setOcr', payload: (next as PredictJson).ocr });
                    }
                }
            } catch (error) {
                console.warn(`读取predict.json失败, @view/default/case/ai-switch:${error.message}`);
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
    };

    /**
     * 相似度Change
     * @param value 值
     */
    const onSimilarChange = (value: number | undefined) =>
        dispatch({ type: 'aiSwitch/setSimilarity', payload: value });

    /**
     * OCR识别Change
     * @param value 值
     */
    const onOcrChange = ({ target }: CheckboxChangeEvent) =>
        dispatch({ type: 'aiSwitch/setOcr', payload: target.checked });

    /**
     * 如不填写补0值
     */
    const onSimilarBlur = ({ target }: FocusEvent<HTMLInputElement>) => {
        if (target.value.trim() === '%') {
            dispatch({ type: 'aiSwitch/setSimilarity', payload: 0 });
        }
    };

    const renderSwitch = () => {

        if (data.length === 0) {
            return null;
        }
        const rows = chunk(data.filter(i => i.hide === false), 5);
        return rows.map((row, i) => <Row style={{ padding: '16px 0' }} key={`AIROW_${i}`}>
            {
                row.map((col, j) => {
                    if (col.hide === false) {
                        return helper.isNullOrUndefinedOrEmptyString(col.tips)
                            ? <Col span={j === 4 ? 4 : 5} key={`AICOL_${j}`}>
                                <label>{col.title}：</label>
                                <Switch
                                    onChange={(checked: boolean) => onSwitchChange(checked, col.type)}
                                    checked={col.use}
                                    size="small" />
                            </Col>
                            : <Col span={j === 4 ? 4 : 5} key={`AICOL_${j}`}>
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
        <Row align="middle" style={{ margin: '2rem 0' }}>
            <Col span={6}>
                <label>设定阈值：</label>
                <InputNumber
                    onChange={onSimilarChange}
                    onBlur={onSimilarBlur}
                    value={similarity}
                    defaultValue={0}
                    min={0}
                    max={100}
                    formatter={value => `${value}%`} />
            </Col>
            <Col span={18} style={{ lineHeight: '30px' }}>
                <label>图片违规分析：</label>
                <Checkbox
                    checked={ocr}
                    onChange={onOcrChange} />
            </Col>
        </Row>
        {renderSwitch()}
    </>
};

export { Predict };
export default connect((state: StateTree) => ({ aiSwitch: state.aiSwitch }))(AiSwitch);