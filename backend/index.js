// This is a relay server for GunDB (used to store data (and provide it)) + it is also used to fetch user details from Moralis server (for authentication)
const dotenv = require('dotenv');
dotenv.config();

const express = require('express')
const Gun = require('gun');
const app = express()
const PORT = process.env.PORT || 5000;

app.use(Gun.serve)

const Moralis = require("moralis/node");
const appId = process.env.MORALIS_APP_ID;
const serverUrl = process.env.MORALIS_SERVER_URL;
const masterKey = process.env.MORALIS_MASTER_KEY;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

Moralis.start({ serverUrl, appId, masterKey });

app.get('/moralisQuery', async (req, res) => {
    const query = new Moralis.Query("User");                    // the User table in the Moralis server is protected, so we have to use masterKey
    const results = await query.find({ useMasterKey: true });
    res.send(results)
})

const server = app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})

Gun({ web: server });