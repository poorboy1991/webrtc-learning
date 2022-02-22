const express = require('express') /*express 服务框架*/ 
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const http = require('http')
const https = require('https')
const app = express() /*实例化express服务*/
const fs = require('fs');
const is_https = process.env.HTTPS; // 模式（dev开发环境，production生产环境）
const path = require("path"); // 获取绝对路径有用
const ip = require('ip');
const mqtt = require('mqtt')
const cors = require('cors');

let deviceId = 'C10121100100221001'

const MQ_CONFIG = {
    client_id: 'server',
    topic_answer_sub: 'getAnswer/p2p/server',
    topic_offer_pub: `postOffer/p2p/${deviceId}`,
    host: 'broker-cn.emqx.io',
    port: '8883',
}

const {
    jsonWrite,
} = require('./utils/index')


let server = null

if(is_https == 1) { // 是否是http
    server = http.createServer(app);
} else {
    const options = {
        key: fs.readFileSync(path.resolve(__dirname, './tls/server.key')), // tls文件路径
        cert: fs.readFileSync(path.resolve(__dirname, './tls/server.crt')), // tls文件路径
        requestCert: false,
        rejectUnauthorized: false
      };
      
    server = https.createServer( options, app );
}


const NODE_ENV = process.env.NODE_ENV


const HOST = ip.address() /*当前ip地址*/ 
const PORT = 9500

app.post('*', bodyParser.urlencoded({ extended: true }),
    function (req, res, next) {
        next();
    });

/*这样会自动记录每次请求信息，放在其他use上面*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//设置跨域访问
app.use(cors());

let obj = {

}

/* 连接mqtt */
const connectUrl = `mqtts://${MQ_CONFIG.host}:${MQ_CONFIG.port}`
const client = mqtt.connect(connectUrl, {
    clientId: MQ_CONFIG.client_id,
    clean: true,
    connectTimeout: 4000,
    username: 'emqx',
    password: 'public',
    reconnectPeriod: 1000,
    cleanSession: true
})

client.on('connect', () => {
    console.log('Connected')
    client.subscribe([MQ_CONFIG.topic_answer_sub], () => {
        console.log(`已订阅获取到设备端answer与candidate`)
    })
})


client.on('message', (topic, payload) => {
    console.log('Received Message:', topic)
    const {candidate, sdp} = JSON.parse(payload)
    if(topic === MQ_CONFIG.topic_answer_sub) {
        if(!obj[deviceId]) {
            obj[deviceId] = {}
        }
        console.info(topic, '1111111111111111111111111111111')
        obj[deviceId].sdp = sdp
        obj[deviceId].candidate = candidate

    }
})


// 轮询查找
async function pollFindOrder(key = 'sdp'){
    
    let order = obj[deviceId] && obj[deviceId][key];
    if(order) return true;

    return new Promise((resolve, reject) => {
        let len = 1;
        let timmer = setInterval(()=>{
            len ++ ;
            order = obj[deviceId] && obj[deviceId][key];
            if(order){
                clearInterval(timmer);
                return resolve(true);
            }
            if(len == 10){
                clearInterval(timmer);
                return resolve(false);
            }
        },1000);
    })
}



/* 拉流接口device URL */
app.post('/pull-stream-device', async(req, res, next) => {
    const params = req.body
    let {offer} = params
    console.info(JSON.parse(offer), 'paramsparamsparamsparams')

    client.publish(MQ_CONFIG.topic_offer_pub, offer, { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error, MQ_CONFIG.topic_offer_pub)
        }
        console.info(JSON.parse(offer), 'offerofferoffer')
    })

    await pollFindOrder('sdp')
    const {sdp, candidate} = obj[deviceId] || {}


    let result = {
        code: 0,
        data: {
            sdp,
            candidate
        },
        msg: "success"
    }
    obj[deviceId] = ''
    jsonWrite(res, result)
})

/** 启动服务 **/
server.listen(PORT, () => {
    console.log(`本地服务启动地址: http${is_https == 1 ? '' : 's'}://${HOST}:%s`, PORT);
});