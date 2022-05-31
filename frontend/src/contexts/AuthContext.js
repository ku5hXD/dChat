import React, { useContext, useState, useEffect } from 'react'
import ReactLoading from 'react-loading';
import axios from 'axios'

const AuthContext = React.createContext()


export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState()
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
    const [signButtonVisible, setSignButtonVisible] = useState(false)
    const [downloadMetamaskButtonVisible, setDownloadMetamaskButtonVisible] = useState(false)
    const [loginwithMetamaskButtonVisible, setLoginWithMetamaskButtonVisible] = useState(false)
    const [isServerDown, setIsServerDown] = useState(false);
    const [loading, setLoading] = useState(true)       // I have set this loading hook to wait for the account to bet fetched from the moralis server (if it exists)

    const getAccounts = async () => {

        const _accounts = await window.ethereum.request({
            method: 'eth_accounts',
        })

        if (_accounts.length === 0) {
            return undefined
        }
        else {
            return _accounts[0]       // this returns the account that is connected to the website
        }

    }

    const handleAxios = (account, callback) => {
        return axios.get('https://dchat-relay-server.herokuapp.com/moralisQuery')
            .then(response => {
                // console.log(response)
                if (response.data.length === 0) {

                    callback(false)
                }
                else {
                    let k = 0;
                    for (let i = 0; i < response.data.length; i++) {

                        if (response.data[i].authData?.moralisEth.id === account) {
                            callback(true)
                            k = 0;
                            break;
                        } else {
                            k = 1;
                        }
                    }
                    if (k === 1) {
                        callback(false)
                    }
                }
            })
            .catch((e) => {

                setIsServerDown(true)
                setLoading(false)
            })
    }

    useEffect(() => {

        if (window.ethereum) {
            let accountExists;
            const checkAccount = async () => {
                accountExists = await getAccounts();

                if (accountExists === undefined) {
                    setLoginWithMetamaskButtonVisible(true)
                    setSignButtonVisible(false)
                    setCurrentUser('')
                    setIsUserAuthenticated(false)
                    setLoading(false)
                }
                else {
                    setCurrentUser(accountExists)
                    setLoginWithMetamaskButtonVisible(false)
                    setSignButtonVisible(true)
                    handleAxios(accountExists, (isUserAuthenticated) => {

                        if (isUserAuthenticated === true) {
                            setIsUserAuthenticated(true)
                            setSignButtonVisible(false)
                            setLoginWithMetamaskButtonVisible(false)
                            setLoading(false)
                        }
                        else {
                            setIsUserAuthenticated(false)
                            setSignButtonVisible(true)
                            setLoginWithMetamaskButtonVisible(false)
                            setLoading(false)
                        }
                    })
                }
            }
            checkAccount()

        }
        else {
            setLoading(false)
            setDownloadMetamaskButtonVisible(true)
        }


        if (window.ethereum) {
            window.ethereum.on('accountsChanged', async function (accounts) {
                window.location.reload(false)
            })
        }
    }, [])

    const value = {
        currentUser,
        isUserAuthenticated,
        signButtonVisible,
        loginwithMetamaskButtonVisible,
        downloadMetamaskButtonVisible
    }
    return (
        <AuthContext.Provider value={value}>
            {loading ? <div style={{ display: 'flex', backgroundImage: 'linear-gradient(#7c37fd, blue)', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><ReactLoading type={'bars'} color={'white'} height={200} width={112} /> </div> : isServerDown ? <div><h1>sorry server is down, come back later</h1></div> : children}
        </AuthContext.Provider>
    )
}
