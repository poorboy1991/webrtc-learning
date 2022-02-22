import React, {useState, useLayoutEffect, Component} from 'react'
import {Link} from 'react-router-dom'
export default class Home extends Component  {


    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
        }
        this.videoRef = React.createRef()
        this.connectRef = React.createRef()
    }

    componentDidMount() {

    }

    componentWillUnmount() {
  
    }

    connectCb = () => {
       
    }

    render() {
        return (
            <div className="">
                <div className="">
                    <Link to={`/simulated-algo-app/device`} activeClassName="active">模拟设备</Link>
                    <Link to={`/simulated-algo-app/app`} activeClassName="active">模拟app客户端</Link>
                    <Link to={`/one-to-one-local`} activeClassName="active">1对1本地连接</Link>
                </div>
            </div>
        )
    }
}
