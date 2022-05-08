const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
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
      const itemCollection = client.db("bikeHaaat").collection("item");

      // auth ////////////////////////////////
      app.post('/login', async(req, res) => {
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '1d'
        });
        res.send({accessToken});
      })


      // read all data ////////////////////////////////////////////////////
      app.get('/inventories', async(req, res) => {
        const query = {};
        const cursor = inventoryCollection.find(query);
        
        const inventories = await cursor.toArray();
        res.send(inventories);
      })

      /////////////////////////////////////////////////////////////////////

      // read one data ///////////////////////////////////////////////////////
      app.get('/inventory/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const inventory = await inventoryCollection.findOne(query);
        res.send(inventory);
      })

      ////////////////////////////////////////////////////////////////////////////

      // create data /////////////////////////////////////
      app.post('/inventoryAdd', async (req, res) => {
        const newInventory = req.body;
        const result = await inventoryCollection.insertOne(newInventory);
        res.send(result);
        console.log("inventory add success");
      })

      //////////////////////////////////////////////////////////////////

      // Update a data
        app.put('/inventory/:id', async (req, res) => {
          const id = req.params.id;
          const data = req.body;
          const filter = { _id: ObjectId(id) };
          const options = { upsert: true };
          const updateDoc = {
              $set: {
                  ...data,
              },
          };
          const result = await inventoryCollection.updateOne(filter, updateDoc, options);
          res.send(result);
      })

      // item collection //////////////////////////////////////////
      
      app.get('/item', async(req, res) => {
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        const email = req.query.email;
        const query = {email};
        const cursor = itemCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      })

      app.post('/item', async(req, res) => {
        const item = req.body;
        const result = await itemCollection.insertOne(item);
        res.send(result);
      })

      //////////////////////////////////////////////////////////////////////////


      // Delete a data //////////////////////////////////////////////////
      app.delete('/inventory/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await inventoryCollection.deleteOne(query);
        res.send(result);
      })

      ///////////////////////////////////////////////////////////////////////////

      
      console.log("Connected to server");
    }
    finally {
      // await client.close();
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