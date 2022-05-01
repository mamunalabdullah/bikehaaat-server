const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware ////////////////////////////////

app.use(cors());
app.use(express.json());

//////////////////////////////////////////////

// MongoDb ///////////////////////////////////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cqkv4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const inventoryCollection = client.db("bikeHaaat").collection("inventory");

      app.get('/inventory', async(req, res) => {
        const query = {};
        const cursor = inventoryCollection.find(query);
        const inventories = await cursor.toArray();
        res.send(inventories);
      })

      app.get('/inventory/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const inventory = await inventoryCollection.findOne(query);
        res.send(inventory);
      })
       
    }
    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


//////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send("server is running..............");
})

app.listen(port, () => {
  console.log("Listening to port", port);
})