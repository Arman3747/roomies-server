const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.nnagfsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const uri = `mongodb+srv://${process.env.roomies_DB_USER}:${process.env.roomies_DB_PASS}@cluster0.nnagfsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const roommatesCollection = client.db('roomies').collection('roommates')


    //Read
    app.get('/roommates', async (req, res)=>{
      const result = await roommatesCollection.find().toArray();
      res.send(result);
    })

    //Read 1 Room
    app.get('/roommates/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await roommatesCollection.findOne(query);
      res.send(result);
    })

    //Create 
    app.post('/roommates', async (req, res) => {
      const newRoommate = req.body;
      // console.log(newRoommate);
      const result = await roommatesCollection.insertOne(newRoommate);
      res.send(result);
    })

    //update
    app.put('/roommates/:id', async (req,res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)}
      const options = { upsert: true};
      const updatedRoom = req.body;
      const updatedDoc = {
        $set : updatedRoom
      }
      const result = await roommatesCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })

    //Delete
    app.delete('/roommates/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await roommatesCollection.deleteOne(query);
      res.send(result);
    })






















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res) => {
    res.send('Room is empty !')
})

app.listen(port, () => {
    console.log(`roomies server is running in port ${port}`)
})