import React, {useState, useLayoutEffect, Component} from 'react'

// import './index.less'

export default class P2pByMqtt extends Component  {


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
                    entry
                </div>
            </div>
        )
    }
}
