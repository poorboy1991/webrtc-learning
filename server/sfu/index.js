const express = require('express')
const http = require('http')
const cors = require('cors')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const PORT = 8080
// 解决跨域问题 
app.use(cors())

let receiverPCs = {} // sfu存储作为接收者的peerconnection 对象 key为userID socketID
let senderPCs = {} // sfu存储作为发送者的peerconnection 对象 key为userID socketID
let users = {}  // users对象存储以roomID为键值，value为 {id: socketId, stream}
let socketToRoom = {} // socketToRoom 对象存储 socketID: roomID

const io = socketIo.listen(server)

io.sockets.on('connection', (socket) => {

})

server.listen(process.env.PORT || PORT, () => {
    console.log(`server running on ${PORT}`)
})