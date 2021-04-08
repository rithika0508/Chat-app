const socket = io()


const form = document.querySelector('.form')
const form_input = form.querySelector('input')
const form_button = form.querySelector('button') 
const messages = document.querySelector('#messages')
const chat_sidebar = document.querySelector('.chat__sidebar')

const message_template = document.querySelector('#message-template').innerHTML 
const location_template = document.querySelector('#location-template').innerHTML
const sidebar_template = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    const $newmessage = messages.lastElementChild
    //height of new message
    const messagesStyle = getComputedStyle(messages)
    const marginHeight = parseInt(messagesStyle.marginBottom)
    const msgHeight = $newmessage.offsetHeight + marginHeight
    
    //visible height
    const visibleHeight = messages.offsetHeight

    //height of messages container
    const containerHeight = messages.scrollHeight
 

    //how much scrolled
    const scrolled = messages.scrollTop + visibleHeight

    
    messages.scrollTop = scrolled

}

socket.on('message', (message) => {
    const html = Mustache.render(message_template, {  
        message:message.text,
        username:message.username,
        time:moment(message.createdAt).format('hh.mm A')    
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage', (location_URL) => {
    const html_loc = Mustache.render(location_template, {
        location: location_URL.text,
        username:location_URL.username,
        time:moment(location_URL.createdAt).format('hh.mm A')
    })
    messages.insertAdjacentHTML('beforeend',html_loc)
    autoScroll()
})

socket.on('roomData', ({ room, user }) => {
    const html = Mustache.render(sidebar_template, {
        room: room,
        users: user
    })
    chat_sidebar.innerHTML = html
})

form.addEventListener('submit', (e) => {
    e.preventDefault()

    form_button.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        form_button.removeAttribute('disabled')
        form_input.value=''
        form_input.focus()
        if(error){
            return console.log(error)
        }
        
    })
})

const sendLocation = document.querySelector('#send-location')
sendLocation.addEventListener('click', () => {
    
    if(!navigator.geolocation){
        return alert('geolocation is not supported by your device!')
    }
    sendLocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position => {
        const lat_lon = {
            latitude:position.coords.latitude,
            longitude: position.coords.longitude,
        }
        socket.emit('sendingLocation', lat_lon, () => {
            sendLocation.removeAttribute('disabled')
        })
    }))
})


socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})
