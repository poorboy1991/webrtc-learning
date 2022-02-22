import React, {useState, useLayoutEffect, Component} from 'react'
import Video from '@/views/components/video'
import {PeerConnection, once} from '@/utils/index'
import request, {apis} from '@/api/request'

const DEVICE_ID = 'C10121100100221001'
export default class App extends Component  {


    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            device_id: DEVICE_ID,
            stream: null
        }
        this.videoRef = React.createRef()
        this.connectRef = React.createRef()
        this.peerApp = null
        this.sdp = ''
        this.sendOffer = once(this.sendOffer)
    }

    componentDidMount() {

    }

    componentWillUnmount() {
  
    }

    sendOffer = async (candi) => {
        const obj = {
            sdp: this.sdp,
            candidate: candi
        }
        const {candidate, sdp} = await request.post({
            url: apis.PULL_STREAM_DEVICE,
            method: 'POST',
            data: {offer: JSON.stringify(obj)}
        })
        await this.peerApp.setRemoteDescription({sdp: sdp, type: 'answer'})
        await this.peerApp.addIceCandidate(candidate)
    }

    pullStream = async () => {
        /* 获取到输入的deviceId */
        const device_id = this.state.device_id
        if(!this.peerApp) {
            let iceServer = {
                "iceServers": [
                    {
                        "url": "stun:stun.l.google.com:19302"
                    }
                ]
            };
            /* 创建peerConnection peerA */
			this.peerApp = new PeerConnection(iceServer)
            console.info('开始创建peerApp-------1')
            this.peerApp.onicecandidate = (e) => {
				if (e.candidate) {
					console.log('peerApp- candidate获取到----', e.candidate);
                    this.sendOffer(e.candidate)
                    // const {candidate} = await request.post({
                    //     url: apis.POST_CANDIDATE,
                    //     method: 'POST',
                    //     data: {candidate: e.candidate}
                    // })

                    // this.peerApp.addIceCandidate(candidate)
                   
				}
			}

            let inboundStream = null
            this.peerApp.ontrack = (ev) => {
                if (ev.streams && ev.streams[0]) {
                    this.setState({
                        stream: e.streams[0]
                    })
                } else {
                    if (!inboundStream) {
                        inboundStream = new MediaStream();
                        this.setState({
                            stream: inboundStream
                        })
                    }
                    inboundStream.addTrack(ev.track)
                }
            }
        }
        /* 设置本地描述后发送offer至服务端然后服务端吊起mqtt连接到对应设备端然后设置远端描述完成，然后设备端创建answer通过mq传入answer给到服务端然后服务端返回给app端 该http请求完成*/
        const offer = await this.peerApp.createOffer({offerToReceiveAudio: 1,offerToReceiveVideo: 1})
        this.sdp = offer.sdp
        await this.peerApp.setLocalDescription(offer)

        // const {sdp} = await request.post({
		// 	url: apis.PULL_STREAM,
        //     method: 'POST',
		// 	data: {offer: encodeURIComponent(offer.sdp)}
		// })
        // await this.peerApp.setRemoteDescription({sdp: decodeURIComponent(sdp), type: 'answer'})

        /* 获取到http返回的answer后设置远端描述 媒体协商完成 */
        /* 获取到candidate后 发送candidate给到服务端然后通过mq传递给设备端，设备端addCandidate， 设备端先存储之前回调的candidate 然后在设置完candidate后在传回给http服务端，服务端回传candidate，该http请求完成*/
        /* 获取到http返回的candidate后app端addCandidate 地址协商完成 */
    }

    render() {
        return (
            <div className="">
                <div className="">
                    <div className="one-to-one-a">
                        <Video
                            autoPlay
                            id='A'
                            muted
                            controls
                            srcObject={this.state.stream}
                        />
                        app端
                    </div>
                    <input value={this.state.device_id} width={200}/>
                    <button onClick={this.pullStream}>呼叫摄像头</button>
                </div>
            </div>
        )
    }
}
