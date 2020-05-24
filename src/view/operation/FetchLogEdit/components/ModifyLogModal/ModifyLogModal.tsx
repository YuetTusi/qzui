import React, { FC, useState, useEffect } from 'react';
import Form from 'antd/lib/form';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/es/date-picker/locale/zh_CN';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import moment, { Moment } from 'moment';
import { Prop } from './ComponentType';
import './ModifyLogModal.less';


const ModifyLogModalTest: FC<Prop> = (props) => {

    const { cancelHandle, visible } = props;
    const { Item } = Form;
    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 8 }
    };

    const [id, setId] = useState<string>('');
    const [startTime, setStartTime] = useState<Moment | null>(moment());
    const [endTime, setEndTime] = useState<Moment | null>(moment());

    useEffect(() => {
        setId(props.entity?._id!);
        setStartTime(moment(props.entity?.m_strStartTime, 'YYYY-MM-DD HH:mm:ss'));
        setEndTime(moment(props.entity?.m_strFinishTime, 'YYYY-MM-DD HH:mm:ss'));
    }, [props.entity]);

    return <Modal
        onOk={() => {
            props.okHandle!({
                id, startTime, endTime
            });
        }}
        onCancel={cancelHandle}
        okText="编辑"
        cancelText="取消"
        width={500}
        title={`编辑`}
        visible={visible}>
        <div className="modify-log-modal-root">
            <Form layout="horizontal" {...formItemLayout}>
                <Item label="开始时间">
                    <DatePicker
                        onChange={(date: Moment | null, dateString: string) => {
                            console.log(date);
                            setStartTime(helper.isNullOrUndefined(date) ? moment() : date);
                        }}
                        format={'YYYY-MM-DD HH:mm:ss'}
                        locale={locale}
                        showTime={true}
                        value={startTime}
                    />
                </Item>
                <Item label="结束时间">
                    <DatePicker
                        onChange={(date: Moment | null, dateString: string) => {
                            setEndTime(helper.isNullOrUndefined(date) ? moment() : date);
                        }}
                        format={'YYYY-MM-DD HH:mm:ss'}
                        locale={locale}
                        showTime={true}
                        value={endTime}
                    />
                </Item>
            </Form>
        </div>
    </Modal>;
};

export default ModifyLogModalTest;
