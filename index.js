const express = require('express'); // express module
const mongoose = require('mongoose');
const api = require('./api.js')
const cors = require('cors')


const app = express();
app.use(express.json())
app.use(cors())

app.use('/api', api)
var introText = "Hi! This is the Backend Assignment provided by Shubham Tiwari. This is the initial page of the API."
PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.send(introText);
})

app.listen(PORT, (req, res) => {
    console.log("Started server at port: ", PORT)
})