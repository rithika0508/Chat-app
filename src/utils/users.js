const users = []

// add User , remove User, getUser, getUsersinroom
const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room) {
        return {
            error:'username and room are required'
        }
    }
    const existingUser = users.find((user) => {
        return user.username===username && user.room===room
    })
    if(existingUser) {
        return {
            error:'username is already in use!'
        }
    }
    const user = { id, username, room }
    users.push(user)
    return {user}
}



const removeUser = (id) => {
    const index = users.findIndex((user) => user.id===id )
    // const User = users.find((user) => user.id===id)
    if(index!==-1){
        const removedUser = users.splice(index, 1)
        return removedUser[0]
        // console.log(User)
        // return { User }
    }


}


const getUser = (id) => {
    const User = users.find((user) => user.id===id)
    if(!User) {
        return {
            error: 'No Users Found!'
        }
    }
    return { User }
}



const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const UsersInRoom = users.filter((user) => user.room===room)
    if(!UsersInRoom) {
        return {
            error:'Room doesnt exist!'
        }
    }

    return UsersInRoom
}

// const a = addUser({
//     id:1,
//     username:'rits',
//     room:'chatroom'
// })
// const b = removeUser(1)
// console.log(b)
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}