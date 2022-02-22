import React, {useState, useLayoutEffect} from 'react'
import {Button, Form, Input} from 'antd'
import style from './index.less'

const FormItem = Form.Item


export default function Entry(props) {

    const {roomid} = props.match.params


    const onFinish = (values) => {
        console.log('Success:', values);
        const {roomid, userid} = values
        props.history.push(`/room-by-sfu/${roomid}/${userid}`)
    }

    return (
        <div className="entry">
            <div className="entry-box">
                <Form 
                    name="room" onFinish={onFinish}
                    initialValues={{roomid}}
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 8,
                    }}
                >
                    <FormItem 
                        label="房间名"
                        name="roomid"
                        rules={[{required: true, message: '请输入房间名'}]}
                        >
                        <Input />
                    </FormItem>
                    <FormItem 
                        label="用户名"
                        name="userid"
                        rules={[{required: true, message: '请输入用户名'}]}
                        >
                        <Input />
                    </FormItem>
                    <FormItem
                        wrapperCol={{
                            offset: 8,
                            span: 1,
                        }}
                    >
                        <Button type="primary" htmlType="submit">进入房间</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    )
}
