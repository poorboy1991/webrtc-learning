import React, {useState, useLayoutEffect, Component} from 'react'
import mqtt from 'mqtt'

import Video from '@/views/components/video'
import {PeerConnection, getUserMedia, once} from '@/utils/index'

let deviceId = 'C10121100100221001'

const MQ_CONFIG = {
    client_id: deviceId,
    topic_answer_sub: 'getAnswer/p2p/server',
    topic_offer_pub: `postOffer/p2p/${deviceId}`,
    host: 'broker-cn.emqx.io',
    port: '8084',
}

export default class Device extends Component  {


    constructor (props) {
        super(props);
        this.state = {
            loaded: false,
            stream: null,
            connectStatus: 0,
        }
        this.videoRef = React.createRef()
        this.connectRef = React.createRef()
        this.peerDevice = null
        this.client = null
        this.init()
        this.sdp = ''
        this.sendAnswer = once(this.sendAnswer)
    }

    init = async() => {
        /*打开摄像头*/
        const stream = await getUserMedia()
        this.mqConnect(stream)
        this.setState({
            stream
        })
        

    }

    sendAnswer = (candi) => {
        const obj = {
            sdp: this.sdp,
            candidate: candi
        }
        this.client.publish(MQ_CONFIG.topic_answer_sub, JSON.stringify(obj), { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error, MQ_CONFIG.topic_answer_sub)
            }
        })
    }

    /* 初始化mqparams */
	initMQParams = () => {
		const url = `wss://${MQ_CONFIG.host}:${MQ_CONFIG.port}/mqtt`
		const options = {
			keepalive: 30,
			protocolId: 'MQTT',
			protocolVersion: 4,
			clean: true,
			reconnectPeriod: 1000,
			connectTimeout: 30 * 1000,
			securemode: 3,
			// will: {
			// 	topic: TOPIC_PUB,
			// 	payload: "Connection Closed abnormally..!",
			// 	qos: 0,
			// 	retain: false,
			// },
			rejectUnauthorized: false,
            cleanSession: true,
		}
		options.clientId = MQ_CONFIG.client_id;
		return {
			url,
			options
		}
	}

    /* 建立mqtt连接 */
	mqConnect = (stream) => {
		const params = this.initMQParams()
		const {url: host, options} = params
		this.setState({ connectStatus: "Connecting" });
		this.client = mqtt.connect(host, options);
		this.createPeerConn(stream)

		if (this.client) {
			this.client.on("connect", () => {
				// this.setState({ connectStatus: "Connected" }, () => {
                    
				// })
                this.client.subscribe([MQ_CONFIG.topic_offer_pub], () => {
                    console.log(`已订阅获取到用户端offer candidate`)
                })

                
			})

			this.client.on("error", (err) => {
				console.error("Connection error: ", err);
				this.client.end()
			})

			this.client.on("reconnect", () => {
                console.log(`reconnect ----`)
				this.setState({ connectStatus: "Reconnecting" });
			})

            this.client.on("message", async (topic, message) => {
                const payload = { topic, message: message.toString() }
                console.info('message',topic)
                if(topic === MQ_CONFIG.topic_offer_pub) {
                    const {sdp, candidate} = JSON.parse(message)
                    console.info(sdp, candidate, 'candidatecandidatecandidatecandidatecandidatecandidate')
                    this.peerDevice.setRemoteDescription({sdp, type: 'offer'})
                    const answer = await this.peerDevice.createAnswer()
                    this.sdp = answer.sdp
                    await this.peerDevice.setLocalDescription(answer)
                    this.peerDevice.addIceCandidate(candidate);
                }
            })
			
		}
	}

    /*创建连接*/
    createPeerConn = (stream) => {
        if(!this.peerDevice) {
            let iceServer = {
                "iceServers": [
                    {
                        "url": "stun:stun.l.google.com:19302"
                    }
                ]
            };
			this.peerDevice = new PeerConnection(iceServer)
            this.peerDevice.onicecandidate = (e) => {
				if (e.candidate) {
                    console.info(e.candidate, '接受到candidate准备发送candidate')
                    this.sendAnswer(e.candidate)
				}
			}

            // 当连接在了，给本地设置 加到pc中音频和视频的媒体流
            if (stream) {
                stream.getTracks().forEach((track) => {
                    console.log('加到pc中音频和视频的媒体流',track);
                    this.peerDevice.addTrack(track);
                })
            }
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {
  
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
                        设备端 设备ID  {MQ_CONFIG.client_id}
                    </div>
                </div>
            </div>
        )
    }
}
