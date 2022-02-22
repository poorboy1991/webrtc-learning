import React, {useState, useLayoutEffect, Component} from 'react'
import Video from '@/views/components/video'
import {PeerConnection, getUserMedia} from '@/utils/index'
// import './index.less'



export default class OneToOneLocal extends Component  {


    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            aStream: null,
            bStream: null
        }
        this.videoRef = React.createRef()
        this.connectRef = React.createRef()
        this.peerA = null
        this.peerB = null
        
    }

    componentDidMount() {

    }

    componentWillUnmount() {
  
    }

    /*呼叫设备*/
    call = async () => {
        /* 打开A端设备摄像头 getUserMedia设置aStream */
        const stream = await getUserMedia()
        this.setState({
            aStream: stream
        })
        /* 创建peerA连接 */
        this.createAPeerConn(stream)
        /* 创建peerB连接 */
        this.createBPeerConn()
        /*A创建offer 然后设置localDesc本地描述，发送offer给B 并且用addTrack加入media*/
        const offer = await this.peerB.createOffer({offerToReceiveAudio: 1,offerToReceiveVideo: 1})
        console.info('peerB创建offer成功-------3')
        await this.peerB.setLocalDescription(offer)
        await this.peerA.setRemoteDescription(offer)
        console.info('B-A互换offer完成-------4')
        
        /*B接受Aoffer设置远端描述 然后创建answer，设置本地描述，然后发送answer给A*/
        const answer = await this.peerA.createAnswer()
        console.info('peerA创建answer成功-------5')
        await this.peerA.setLocalDescription(answer)
        await this.peerB.setRemoteDescription(answer)
        console.info('A-B互换answer完成-------6')
        /*B在onTrack回调中获取到stream 播放stream*/
    }

    hangup = () => {
        this.peerA && this.peerA.close();
        this.peerB && this.peerB.close();
        this.peerA = null;
        this.peerB = null;
    }

    /*创建A连接*/
    createAPeerConn = (stream) => {
        if(!this.peerA) {
            let iceServer = {
                "iceServers": [
                    {
                        "url": "stun:stun.l.google.com:19302"
                    }
                ]
            };
			this.peerA = new PeerConnection(iceServer)
            console.info('开始创建peerA-------1')
            this.peerA.onicecandidate = (e) => {
				if (e.candidate) {
					console.log('peerA- candidate获取到----', e.candidate);
                    this.peerB.addIceCandidate(e.candidate);
				}
			}

            // 当连接在了，给本地设置 加到pc中音频和视频的媒体流
            if (stream) {
                stream.getTracks().forEach((track) => {
                    console.log('加到pc中音频和视频的媒体流',track);
                    this.peerA.addTrack(track);
                })

                // this.peerA.addStream(stream); // 添加本地流

            }
        }
    }

    /*创建B连接*/
    createBPeerConn = () => {
        if(!this.peerB) {
            let iceServer = {
                "iceServers": [
                    {
                        "url": "stun:stun.l.google.com:19302"
                    }
                ]
            };
			this.peerB = new PeerConnection(iceServer)
            console.info('开始创建peerB-------2')
            this.peerB.onicecandidate = (e) => {
				if (e.candidate) {
					console.log('peerB- candidate获取到----', e.candidate);
                    this.peerA.addIceCandidate(e.candidate);
				}
			}

            // this.peerB.onaddstream = (event) => { // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
            //     console.log('event-stream', event);
            //     this.setState({
            //         bStream: event.stream
            //     })
            // };
            let inboundStream = null
            this.peerB.ontrack = (ev) => {
                if (ev.streams && ev.streams[0]) {
                    this.setState({
                        bStream: e.streams[0]
                    })
                } else {
                    if (!inboundStream) {
                        inboundStream = new MediaStream();
                        this.setState({
                            bStream: inboundStream
                        })
                    }
                    inboundStream.addTrack(ev.track);
                }
            };
        }
    }

    render() {
        const {aStream, bStream} = this.state
        return (
            <div className="">
                <div className="">
                    <div className="one-to-one-a">
                        <Video
                            autoPlay
                            id='A'
                            muted
                            controls
                            srcObject={aStream}
                        />
                        播放端
                    </div>
                    <div className="one-to-one-b">
                        <Video
                            autoPlay
                            id='B'
                            muted
                            controls
                            srcObject={bStream}
                        />
                        呼叫端
                        <button onClick={this.call}>呼叫</button>
                        <button onClick={this.hangup}>挂断</button>

                    </div>
                </div>
            </div>
        )
    }
}
