import React, { Component } from 'react';
import Form, { FormComponentProps } from 'antd/lib/form';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/es/date-picker/locale/zh_CN';
import Modal from 'antd/lib/modal';
import CFetchLog from '@src/schema/CFetchLog';
import { helper } from '@src/utils/helper';
import './ModifyLogModal.less';
import moment, { Moment } from 'moment';
import { StoreData } from '@src/model/operation/FetchLogEdit/ModifyLogModal';
import { StoreComponent } from '@src/type/model';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 当前编辑的数据
     */
    entity?: CFetchLog;
    /**
     * 编辑回调
     */
    okHandle?: (arg0: any) => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

interface State {
    id: string;
    startTime: Moment;
    endTime: Moment;
}

class ModifyLogModal extends Component<Prop, State>{
    constructor(props: Prop) {
        super(props);
        this.state = {
            id: '',
            startTime: moment(),
            endTime: moment()
        };
    }
    componentDidMount() {
    }
    componentWillReceiveProps(nextProps: Prop) {
        const { entity } = nextProps;
        this.setState({
            id: nextProps.entity?._id!,
            startTime: helper.parseDate(entity?.m_strStartTime!, 'YYYY-MM-DD HH:mm:ss'),
            endTime: helper.parseDate(entity?.m_strFinishTime!, 'YYYY-MM-DD HH:mm:ss')
        });
    }
    render() {
        const { cancelHandle, visible } = this.props;
        const { Item } = Form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 8 }
        };
        return <Modal
            onOk={() => {
                this.props.okHandle!({
                    id: this.state.id,
                    startTime: this.state.startTime,
                    endTime: this.state.endTime
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
                                this.setState({
                                    startTime: helper.isNullOrUndefined(date) ? moment() : date!
                                });
                            }}
                            format={'YYYY-MM-DD HH:mm:ss'}
                            locale={locale}
                            showTime={true}
                            value={this.state.startTime}
                        />
                    </Item>
                    <Item label="结束时间">
                        <DatePicker
                            onChange={(date: Moment | null, dateString: string) => {
                                this.setState({
                                    endTime: helper.isNullOrUndefined(date) ? moment() : date!
                                });
                            }}
                            format={'YYYY-MM-DD HH:mm:ss'}
                            locale={locale}
                            showTime={true}
                            value={this.state.endTime}
                        />
                    </Item>
                </Form>
            </div>
        </Modal>;
    }
}

export default ModifyLogModal;
