import { ipcRenderer, remote, OpenDialogReturnValue, IpcRendererEvent } from 'electron';
import React, { memo, FC, MouseEvent, useState, useRef } from 'react';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import moment from 'moment';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import { withModeButton } from '@src/components/enhance';
import { useMount, useSubscribe } from '@src/hooks';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@src/utils/helper';
import localStore, { LocalStoreKey } from '@src/utils/localStore';
import { FormValue } from './FormValue';
import { Prop } from './ComponentTypes';

const { Option } = Select;
const ModeButton = withModeButton()(Button);

const ImportDataModal: FC<Prop> = (props) => {

    const [dataPath, setDataPath] = useState<string>('');
    const [unitSelectData, setUnitSelectData] = useState<any[]>([]);

    //*保存选中检验员的名字
    let officerName = useRef('');
    //*保存选中采集单位的名字
    let unitName = useRef('');

    const currentUnitNo = useRef('');
    const currentUnitName = useRef('');

    useMount(() => {
        const { dispatch } = props;
        dispatch!({ type: 'importDataModal/queryCaseList' });
        dispatch!({ type: 'importDataModal/queryOfficerList' });

        currentUnitNo.current = localStore.get(LocalStoreKey.UnitCode);
        currentUnitName.current = localStore.get(LocalStoreKey.UnitName);
        unitName.current = currentUnitName.current;
    });

    /**
     * 按关键字查询单位信息
     * @param result 查询结果
     */
    const queryUnitHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
        const { data } = result;
        if (data.rows && data.rows.length > 0) {
            setUnitSelectData(data.rows);
        }
    };

    useSubscribe('query-db-result', queryUnitHandle);

    /**
     * 绑定案件下拉数据
     */
    const bindCaseSelect = () => {
        const { caseList } = props.importDataModal!;
        const { Option } = Select;
        return caseList.map((opt: CCaseInfo) => {
            let [caseName,] = opt.m_strCaseName.split('_');
            return <Option
                value={opt.m_strCasePath}
                key={helper.getKey()}>
                {`${caseName}（${moment(opt.createdAt).format('YYYY-M-D HH:mm:ss')}）`}
            </Option>
        });
    }

    /**
     * 绑定采集人员下拉
     */
    const bindOfficerSelect = () => {
        // m_strCoronerName
        const { officerList } = props.importDataModal!;
        const { Option } = Select;
        return officerList.map(opt => {
            return <Option
                value={opt.no}
                data-name={opt.name}
                data-id={opt.no}
                key={helper.getKey()}>
                {`${opt.name}（${opt.no}）`}
            </Option>
        });
    }

    /**
     * 绑定采集单位下拉
     */
    const bindUnitSelect = () => {
        let list = unitSelectData.map(i => <Option
            data-name={i.PcsName}
            value={i.PcsCode}>
            {i.PcsName}
        </Option>);
        if (!helper.isNullOrUndefinedOrEmptyString(currentUnitNo.current)
            && unitSelectData.find(i => i.PcsCode === currentUnitNo.current) === undefined) {
            list.push(<Option
                data-name={currentUnitName.current}
                value={currentUnitNo.current!}
                key={helper.getKey()}>{currentUnitName.current}</Option>);
        }
        return list;
    }

    /**
     * 采集单位下拉Search事件
     */
    const unitListSearch = debounce((keyword: string) => {
        ipcRenderer.send('query-db', keyword);
    }, 800);
    /**
     * 采集人员下拉Change事件
     */
    const officerSelectChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
        const { props } = (opt as JSX.Element);
        officerName.current = props['data-name'];
    }
    /**
     * 采集单位下拉Change事件
     */
    const unitListChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
        unitName.current = (opt as JSX.Element).props['data-name'];
    }

    const selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
        const { resetFields } = props.form;
        remote.dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
            .then((val: OpenDialogReturnValue) => {
                resetFields(['dataPath']);
                if (val.filePaths && val.filePaths.length > 0) {
                    setDataPath(val.filePaths[0]);
                }
            });
    }

    /**
     * 关闭框清空属性
     */
    const resetFields = () => {
        officerName.current = '';
        unitName.current = '';
        setDataPath('');
    }

    /**
     * 表单提交
     */
    const formSubmit = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const { validateFields } = props.form;
        validateFields((errors: any, values: FormValue) => {
            if (!errors) {

                console.log(officerName.current);
                console.log(unitName.current);
                console.log(values);
                //TODO: 在此调用saveHandle传递数据
                // props.saveHandle!(indata);
            }
        });
    }

    /**
     * 渲染表单
     */
    const renderForm = (): JSX.Element => {
        const { Item } = Form;
        const { getFieldDecorator } = props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 19 }
        };

        return <Form layout="horizontal" {...formItemLayout}>
            <Row>
                <Col span={24}>
                    <Item label="数据位置">
                        {getFieldDecorator('dataPath', {
                            initialValue: dataPath,
                            rules: [{ required: true, message: '请选择第三方数据位置' }]
                        })(<Input
                            addonAfter={<Icon type="ellipsis" onClick={selectDirHandle} />}
                            readOnly={true}
                            placeholder="第三方数据所在位置"
                            onClick={selectDirHandle} />
                        )}
                    </Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Item label="案件名称">
                        {getFieldDecorator('casePath', {
                            rules: [{
                                required: true,
                                message: '请选择案件'
                            }]
                        })(<Select
                            notFoundContent="暂无数据"
                            placeholder="选择一个案件">
                            {bindCaseSelect()}
                        </Select>)}
                    </Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Item label="采集单位">
                        {getFieldDecorator('unit', {
                            rules: [{
                                required: true,
                                message: '请选择采集单位'
                            }], initialValue: currentUnitNo.current
                        })(<Select
                            showSearch={true}
                            placeholder={"输入单位名称进行查询"}
                            defaultActiveFirstOption={false}
                            notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            showArrow={false}
                            filterOption={false}
                            onSearch={unitListSearch}
                            onChange={unitListChange}>
                            {bindUnitSelect()}
                        </Select>)}
                    </Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Item label="采集人员" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('officer', {
                            rules: [{
                                required: true,
                                message: '请选择采集人员'
                            }]
                        })(<Select
                            notFoundContent="暂无数据"
                            placeholder="请选择一位采集人员"
                            onChange={officerSelectChange}>
                            {bindOfficerSelect()}
                        </Select>)}
                    </Item>
                </Col>
                <Col span={12}>
                    <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                        {
                            getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '请填写手机名称'
                                }]
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Item label="手机持有人" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                        {
                            getFieldDecorator('user', {
                                rules: [{
                                    required: true,
                                    message: '请填写持有人'
                                }]
                            })(<Input placeholder="持有人姓名" maxLength={20} />)
                        }
                    </Item>
                </Col>
                <Col span={12}>
                    <Item label="手机品牌" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                        {
                            getFieldDecorator('manufacturer', {
                                initialValue: ''
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Item label="手机型号" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                        {
                            getFieldDecorator('model', {
                                initialValue: ''
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                </Col>
                <Col span={12}>
                    <Item label="手机编号" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                        {
                            getFieldDecorator('mobileNo', {
                                initialValue: ''
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                </Col>
                <Col span={12}>
                </Col>
            </Row>
        </Form>
    };

    return <div className="case-input-modal">
        <Modal
            width={800}
            visible={props.visible}
            title="导入信息录入"
            destroyOnClose={true}
            onCancel={() => {
                resetFields();
                props.cancelHandle!();
            }}
            afterClose={() => setDataPath('')}
            footer={[
                <ModeButton
                    type="default"
                    icon="close-circle"
                    key={helper.getKey()}
                    onClick={() => props.cancelHandle!()}>
                    取消</ModeButton>,
                <ModeButton
                    type="primary"
                    icon="import"
                    onClick={formSubmit}>
                    导入</ModeButton>
            ]}>
            <div>
                {renderForm()}
            </div>
        </Modal>
    </div>;
};


export default memo(connect((state: any) => {
    return {
        importDataModal: state.importDataModal
    }
})(Form.create({ name: 'importData' })(ImportDataModal)));