
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const express = require('express')
const Filter = require('bad-words')

const port = process.env.PORT || 3000

const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { UV_FS_O_FILEMAP } = require('constants')
const app = express()

app.use(express.static(path.join(__dirname,'../public')))


const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('new web socket connnection')
    
    socket.on('join',({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if(error) {
            return callback(error)
        }
        callback()
        socket.join(user.room)

        socket.emit('message', generateMessage(`Welcome`, user.username))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} joined`, user.username))
        io.to(user.room).emit('roomData', {
            room: user.room,
            user: getUsersInRoom(user.room)
        })
        
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if(filter.isProfane(msg)) {
            return callback('profanity is not allowed')
        }
        const { error, User }= getUser(socket.id)
        if(error) {
            return callback(error)
        }
        io.to(User.room).emit('message', generateMessage(msg, User.username))
        callback()
        
    })

    socket.on('sendingLocation', (lat_lon, callback) => {
        const { error, User } = getUser(socket.id)
        if(error) {
            return callback(error)
        }
        io.to(User.room).emit('locationMessage', generateMessage(`https://google.com/maps/?q=${lat_lon.latitude},${lat_lon.longitude}`, User.username))
        callback()
    })

    socket.on('disconnect', () => {
        const User = removeUser(socket.id)
        if(User) {
            io.to(User.room).emit('message', generateMessage(`Bye! I left the chat room!`, User.username))
            io.to(User.room).emit('roomData', {
                room: User.room,
                user:getUsersInRoom(User.room)[0]
            })
        }
        
    })
})
server.listen(port, () => {
    console.log('server on port 3000');
})