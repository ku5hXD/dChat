import React, { useEffect, useState, useReducer, useRef } from 'react'
import { useAuth } from "../contexts/AuthContext"
import '../css/Dashboard.css'
import Gun from 'gun'
import Identicon from 'react-identicons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
const md5 = require('md5');

const { customAlphabet } = require('nanoid');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 15);


const gun = Gun({
    peers: [
        'https://dchat-relay-server.herokuapp.com/gun'
    ]
})

// create the initial state to hold the messages
const initialState = {                          // will have to use local variable (Redux, but local (samaj rahe ho, samaj rahe ho)) to store the friend list and messages bcoz when I am using hooks for storing the same, I was having problem listening to new friend added or new message
    currentUserFriends: [],
    currentSelectedFriendChat: []
}

// Create a reducer that will update the messages array
function reducer(state, actionWithData) {
    switch (actionWithData.type) {
        case 'updateFriend':
            return {
                currentUserFriends: [...state.currentUserFriends, { name: actionWithData.name, address: actionWithData.address }],
                currentSelectedFriendChat: [...state.currentSelectedFriendChat]
            }
        case 'updateMessage':
            return {
                currentUserFriends: [...state.currentUserFriends],
                currentSelectedFriendChat: [...state.currentSelectedFriendChat, { address: actionWithData.address, message: actionWithData.message, time: actionWithData.time }]
            }
        case 'userReset': {
            return {
                currentUserFriends: [...state.currentUserFriends],
                currentSelectedFriendChat: []
            }
        }
        default:
            return state;
    }

}


// for duplicating and sorting the chat
let duplicateChatArray = []


export const Dashboard = () => {

    const { currentUser } = useAuth()

    const [currentUserName, setCurrentUserName] = useState('')

    const [friendSearch, setFriendSearch] = useState()

    const [currentFriendSelected, setCurrentFriendSelected] = useState({})

    const currentMessage = useRef(null);


    // initialize the reducer & state for holding the messages array
    const [state, dispatch] = useReducer(reducer, initialState)


    useEffect(() => {

        gun.get("pGwuSPniR4148YpHNrvK0xgN").put({ null: null })         // this is for first user entering our website  // this is to make the node with {null: null} (if it is not already made) because in some components we are directly looping the data of the node(which might not be created yet)
        gun.get(currentUser + 'friends').put({ null: null })                         // this is to make the node with {null: null} (if it is not already made) because in some components we are directly looping the data of the node(which might not be created yet)
        gun.get(currentUser + 'messagesdbnames').put({ null: null })

        gun.get("pGwuSPniR4148YpHNrvK0xgN").once(data => {
            setCurrentUserName(data[currentUser])
        })

        gun.get(currentUser + 'friends').map().once((value, key) => {        // creating the friend list and listening for new friend also (using 'map()')

            dispatch({
                type: 'updateFriend',                       // telling reducer what to do!!
                name: value,
                address: key
            })
        })

    }, [])

    const messagesEndRef = useRef(null)



    useEffect(() => {

        dispatch({
            type: 'userReset'
        })


        if (currentFriendSelected.address !== undefined) {
            gun.get(currentUser + 'messagesdbnames').once((data) => {

                let dbName = data[currentFriendSelected.address + 'dbname']
                gun.get(dbName).map().once((data) => {

                    if (data === undefined || data?.address === null || data?.address === undefined) {

                    }
                    else {
                        // console.log(data.address, data.message, data.time)
                        dispatch({
                            type: 'updateMessage',                       // telling reducer what to do!!
                            address: data.address,
                            message: data.message,
                            time: data.time
                        })
                    }
                }, { wait: 2 })
            })
        }

    }, [currentFriendSelected])

    const handleFriendSearchButton = () => {

        if (friendSearch === currentUser) {
            alert('I see what you did there :P')
        }
        else {
            let friendAlreadyExist = false;
            gun.get(currentUser + 'friends').on(data => {

                for (const prop in data) {
                    if (friendSearch === prop) {
                        friendAlreadyExist = true;
                        break;
                    }
                    else {
                        friendAlreadyExist = false;
                    }
                }
            })

            if (friendAlreadyExist) {
                alert('Friend already exists!!')
            }
            else {
                gun.get("pGwuSPniR4148YpHNrvK0xgN").once(data => {
                    let userExists = false;
                    for (const prop in data) {
                        if (friendSearch === prop) {
                            let friendObject = {}
                            let friendObjectForYourFriend = {}
                            let messageDBNameObject = {}
                            let messageDBNameObjectForYourFriend = {}
                            friendObject[friendSearch] = data[prop];
                            messageDBNameObject[friendSearch + 'dbname'] = md5(currentUser + friendSearch)
                            friendObjectForYourFriend[currentUser] = currentUserName;
                            messageDBNameObjectForYourFriend[currentUser + 'dbname'] = md5(currentUser + friendSearch)
                            gun.get(currentUser + 'friends').put(friendObject)                                                         // we have to add friend to our friend list 
                            gun.get(friendSearch + 'friends').put(friendObjectForYourFriend)                                          // and we have to add our name in the friend's friend list also
                            gun.get(currentUser + 'messagesdbnames').put(messageDBNameObject)                                        // this is the database containing database names for different friends (for chat obvio)
                            gun.get(friendSearch + 'messagesdbnames').put(messageDBNameObjectForYourFriend)                         // this is for updating friend's database (containing databasename)
                            gun.get(md5(currentUser + friendSearch)).put({ null: { address: null, message: null, time: null } })   // this is to make the node with {null: null} (if it is not already made) because in some components we are directly looping the data of the node(which might not be created yet)
                            userExists = true;
                            setFriendSearch('')
                            break;
                        }
                        else {
                            // console.log('i was here')
                            userExists = false;
                        }
                    }
                    if (!userExists) {
                        alert("Sorry, user doesn't exists!!")
                        setFriendSearch('')
                    }
                    else {
                        alert('Friend Added Successfully!!')
                        setFriendSearch('')
                    }
                })
            }
            // gun.get(md5(currentUser + friendSearch))
            // gun.get(currentUser + 'friends').once(data => console.log(data))
            // gun.get(currentUser + 'messagesdbnames').once(data => console.log(data))
            // gun.get("pGwuSPniR4148YpHNrvK0xgN").once(data => console.log(data))
        }
    }

    const handleTitle = () => {
        if (currentFriendSelected.name !== undefined) {
            return (
                <div className='friendNameRightDivDash'>  <Identicon className='friendsIdenticonSecond' string={currentFriendSelected.address} size={40} />  <h1>{currentFriendSelected.name}</h1>   </div>
            )
        }
        else {
            return (
                <h1 className='friendNameRightDivDash'>select a friend...</h1>
            )
        }
    }

    const sortChat = () => {
        duplicateChatArray = state.currentSelectedFriendChat.slice()
        duplicateChatArray.sort(function (a, b) {

            if (a.time.length === 23) {
                var timeA = new Date("" + a.time.slice(16, 18) + " " + a.time.slice(13, 15) + " " + a.time.slice(20, 22) + " " + a.time.slice(0, 11))
            }
            else {
                var timeA = new Date("" + a.time.slice(15, 17) + " " + a.time.slice(12, 14) + " " + a.time.slice(19, 21) + " " + a.time.slice(0, 10))
            }

            if (b.time.length === 23) {
                var timeB = new Date("" + b.time.slice(16, 18) + " " + b.time.slice(13, 15) + " " + b.time.slice(20, 22) + " " + b.time.slice(0, 11))
            }
            else {
                var timeB = new Date("" + b.time.slice(15, 17) + " " + b.time.slice(12, 14) + " " + b.time.slice(19, 21) + " " + b.time.slice(0, 10))
            }

            if (timeA < timeB)
                return -1
            if (timeA > timeB)
                return 1
            return 0
        })

        // for auto scrolling to bottom 
        if (messagesEndRef) {
            messagesEndRef.current?.addEventListener('DOMNodeInserted', event => {
                const { currentTarget: target } = event;
                target.scroll({ top: target.scrollHeight });
            });
        }
    }

    const displayDate = (chatDate) => {
        if (chatDate.length === 23) {
            return "" + chatDate.slice(0, 5) + chatDate.slice(8, 23)
        }
        else {
            return "" + chatDate.slice(0, 4) + chatDate.slice(8, 22)
        }
    }

    return (
        <div className='mainDivDash'>
            <div className='topBarDash'>
                <h1 className='mainTitleDash'>Welcome to <span className='dOfdChatDash'>d</span>Chat,<span className='currentUserNameDash'>{currentUserName}</span> </h1>
            </div>
            <div className='otherThanTopBarDivDash'>
                <div className='leftDivDash'>
                    <div className='leftDivWrapperDash'>
                        <div className='leftDivTopDash' >
                            <form onSubmit={e => { e.preventDefault(); }}>
                                <label className='friendInputLabel'>
                                    <input type="text" placeholder='add friends...  [eth address]' name="name" className='friendSearchFieldDash' value={friendSearch} onChange={(e) => { setFriendSearch(e.target.value.toLowerCase()) }} />
                                    <FontAwesomeIcon className='searchIconDash' icon={faPlus} onClick={handleFriendSearchButton} />
                                </label>
                            </form>
                        </div>
                        <div className='leftDivBottomDash'>

                            {
                                state.currentUserFriends.map((data, index) => {
                                    if (data.address === '_' || data.address === 'null') {

                                    }
                                    else {
                                        return (
                                            <div className='nameOfFriendsDash' name={data.name} address={data.address} onClick={(e) => {
                                                setCurrentFriendSelected({ name: e.currentTarget.getAttribute('name'), address: e.currentTarget.getAttribute('address') })
                                            }}>
                                                <Identicon className='friendsIdenticon' string={data.address} size={35} /> <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>{data.name}</span>
                                            </div>
                                        )
                                    }
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className='rightDivDash'>
                    <div className='rightDivWrapperDash'>
                        <div className='rightDivTopDash'>
                            {handleTitle()}
                        </div>
                        <div ref={messagesEndRef} className='rightDivChatDash'>
                            {sortChat()}
                            {
                                currentFriendSelected.address === undefined ?
                                    null
                                    : duplicateChatArray?.map((data, index) => {
                                        // console.log('i was here', data.message)

                                        return (
                                            <div style={data.address === currentUser ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', wordWrap: 'break-word' } : { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <div key={data.time} className={data.address === currentUser ? 'ownChatTextDivDash ChatTextDivDash--highlight' : 'friendChatTextDivDash ChatTextDivDash--highlight'}>
                                                    <p>{data.message}</p>
                                                    <p className='messageTextTimeDash'>{displayDate(data.time)}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                            }
                        </div>
                        <div className='messageInputDivDash'>
                            <form onSubmit={e => {
                                e.preventDefault();
                                if (currentMessage.current.value === undefined || currentMessage.current.value === '') {

                                }
                                else {
                                    /* store messages in database*/

                                    gun.get(currentUser + 'messagesdbnames').once((data) => {

                                        let dbName = data[currentFriendSelected.address + 'dbname']
                                        let id = nanoid()
                                        let newMessageObject = {}

                                        let dateRemaster = new Date();
                                        let finalDate = "";
                                        if (dateRemaster.getHours() === 0) {
                                            finalDate += "12";
                                        }
                                        else {
                                            finalDate += "" + (dateRemaster.getHours() > 12 ? dateRemaster.getHours() - 12 : dateRemaster.getHours());
                                        }
                                        if (dateRemaster.getMinutes() < 10) {
                                            finalDate += ":0" + dateRemaster.getMinutes();
                                        }
                                        else {
                                            finalDate += ":" + dateRemaster.getMinutes();
                                        }
                                        finalDate += ":" + dateRemaster.getSeconds();
                                        finalDate += " " + (dateRemaster.getHours() > 12 ? "PM " : "AM ");
                                        dateRemaster.getDate() < 10 ? finalDate += '[0' + dateRemaster.getDate() : finalDate += "[" + dateRemaster.getDate();
                                        (dateRemaster.getMonth() + 1) < 10 ? finalDate += '/0' + (dateRemaster.getMonth() + 1) : finalDate += '/' + (dateRemaster.getMonth() + 1);
                                        finalDate += ("/'" + dateRemaster.getFullYear().toString().slice(2));
                                        finalDate += "]"

                                        newMessageObject[id] = { address: currentUser, message: currentMessage.current.value, time: finalDate }
                                        gun.get(dbName).put(newMessageObject)
                                        currentMessage.current.value = ''
                                    })
                                }
                            }}>
                                <label>
                                    <input type="text" placeholder='Type a message' name="name" className='messsageInputDash' ref={currentMessage} />
                                </label>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
