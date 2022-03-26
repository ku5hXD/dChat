import React, { useEffect, useState } from "react";
import '../css/Login.css'
import { useMoralis } from "react-moralis";
import metamasklogo from '../images/metamask.png';
import Web3 from 'web3';
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import Identicon from 'react-identicons';
import Gun from 'gun'

const gun = Gun({
    peers: [
        'https://dchat-relay-server.herokuapp.com/gun'
    ]
})



const Login = () => {

    const { currentUser, isUserAuthenticated, signButtonVisible, loginwithMetamaskButtonVisible, downloadMetamaskButtonVisible } = useAuth()
    const { authenticate } = useMoralis();
    const navigate = useNavigate()
    const [name, setName] = useState('')

    useEffect(() => {

        gun.get("pGwuSPniR4148YpHNrvK0xgN").put({ null: null })           // this is to make the node with {null: null} (if it is not already made) because in some components we are directly looping the data of the node(which might not be created yet)
        gun.get(currentUser + 'friends').put({ null: null })                         // this is to make the node with {null: null} (if it is not already made) because in some components we are directly looping the data of the node(which might not be created yet)
        gun.get(currentUser + 'messagesdbnames').put({ null: null })

        if (isUserAuthenticated) {
            navigate("/")
        }
    }, [])


    const handleMetamaskLogin = async () => {

        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()                 // this connects our website with the metamask wallet of the user
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider downloading MetaMask!')
        }
    }

    const handleMetamaskDownload = async () => {
        window.location.href = 'https://metamask.io/download'
    }

    const handleMoralisAuth = async () => {
        if (name === '' || name.trim() === '') {
            window.alert('Please enter your name')
        }
        else {
            await authenticate()                    // this sends the information of the metamask account to the Moralis Database
            const data = {}
            data[currentUser] = name
            gun.get("pGwuSPniR4148YpHNrvK0xgN").put(data)               // storing the name of users with respect to their address, "pGwuSPniR4148YpHNrvK0xgN" is the name of the node
            window.location.reload(false)
        }
    }

    const handleNameChange = (e) => {
        setName(e.target.value)
    }

    return (
        <div className='mainDiv'>
            {signButtonVisible ? <div className="currentUserAddressAndIdenticon"> <Identicon className='currentUserIdenticon' string={currentUser} size={40} />  <p className='currentUserAddress'>{currentUser}</p> </div> : null}

            <h1 className='mainTitle'>Welcome to '<span className='dOfdChat'>d</span>Chat'</h1>
            <p className='appInformation'> a peer to peer chatting application </p>
            <div className='loginDiv'>
                <div className='loginDivTopPart'>
                    {!signButtonVisible ? <h4 className='textLogin'>LOGIN</h4> : <h4 className='textLogin'>LOGGED IN</h4>}
                    <svg className='svgImageInsideLoginDiv' width="59" height="16" viewBox="0 0 59 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M58 8C58 11.9278 55.03 15 51.5 15C47.97 15 45 11.9278 45 8C45 4.07223 47.97 1 51.5 1C55.03 1 58 4.07223 58 8Z" stroke="black" stroke-width="2" />
                        <circle cx="30" cy="8" r="7" stroke="black" stroke-width="2" />
                        <circle cx="8" cy="8" r="7" stroke="black" stroke-width="2" />
                    </svg>
                </div>
                <hr className='hrInsideTheLoginDiv' />
                <div className='walletConnectinsideLoginDiv'>
                    {signButtonVisible ? <p className='WalletConnectedText'>Wallet connected !!</p> : downloadMetamaskButtonVisible ? <p className='connectYourWalletText'>Metamask not detected !</p> : <p className='connectYourWalletText'>Connect your wallet</p>}
                    {downloadMetamaskButtonVisible ? <button className='metamaskDownloadButton' onClick={handleMetamaskDownload}><img src={metamasklogo} alt="" className='metamaskLogo' /> Download MetaMask</button> : null}
                    {loginwithMetamaskButtonVisible ? <button className='metamaskConnectButton' onClick={handleMetamaskLogin}><img src={metamasklogo} alt="" className='metamaskLogo' />MetaMask</button> : null}
                    {signButtonVisible ? <form onSubmit={e => { e.preventDefault(); }}>
                        <label>
                            <input type="text" placeholder='your name here...' name="name" className='nameInputField' onChange={handleNameChange} />
                        </label>
                    </form> : null}
                    {signButtonVisible ? <button className='metamaskClickToStartButton' onClick={handleMoralisAuth}><img src={metamasklogo} alt="" className='metamaskLogo' />click to START</button> : null}
                    <p className='downloadMetamaskText'>want to learn about metamask? <button className='downloadMetamaskTextButton'><a style={{ textDecoration: 'none', color: 'black' }} href='https://metamask.io/' target="_blank">click here! </a> </button> </p>
                </div>
            </div>
        </div>
    )
}

export default Login