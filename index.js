const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Room is empty !')
})

app.listen(port, () => {
    console.log(`roomies server is running in port ${port}`)
})