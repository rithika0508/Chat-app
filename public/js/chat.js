const socket = io()
// socket.on('countUpdated', (count) => {
//     console.log(count);
//     console.log('count updated ! ')
// })

// const increment = document.querySelector('#increment')
// increment.addEventListener('click', () => {
//     socket.emit('increment')
// })





const form = document.querySelector('.form')   //for emiting messages to server using event listeners
const form_input = form.querySelector('input')   //for clearing the input field after msg sent
const form_button = form.querySelector('button')   //for disabling this button while msg is being sent
const messages = document.querySelector('#messages')   //for rendering the mustache template to this div template
const chat_sidebar = document.querySelector('.chat__sidebar')

const message_template = document.querySelector('#message-template').innerHTML      //mustache template which is html
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
    console.log(visibleHeight)

    //height of messages container
    const containerHeight = messages.scrollHeight
    console.log(containerHeight)

    //how much scrolled
    const scrolled = messages.scrollTop + visibleHeight
    console.log(messages.scrollTop)
    console.log(scrolled)
    // if(scrolled )
    messages.scrollTop = scrolled

}

socket.on('message', (message) => {
    const html = Mustache.render(message_template, {  //included mustache library in html
        message:message.text,
        username:message.username,
        time:moment(message.createdAt).format('hh.mm A')    //moment.js library  in net=momentjs.com
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
    // messages.appendChild(message)
})

socket.on('locationMessage', (location_URL) => {
    const html_loc = Mustache.render(location_template, {
        location: location_URL.text,
        username:location_URL.username,
        time:moment(location_URL.createdAt).format('hh.mm A')
    })
    // // html.setAttribute('href', location_URL)
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
        console.log('message delivered!')
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
            console.log('location shared!')
        })
    }))
})


socket.emit('join', { username, room }, (error) => {
    if(error) {
        console.log(error)
        alert(error)
        location.href = '/'
    }
})









// const input_message = document.querySelector('#input_message')
// const msg = document.querySelector('#msg')
// input_message.addEventListener('click', (e) => {
//     e.preventDefault()
//     socket.emit('sendMessage', msg.value)
// })
