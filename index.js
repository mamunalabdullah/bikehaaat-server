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

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({message: 'Unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if(err){
        return res.status(403).send({message: 'Forbidden access'});
      }
      console.log('decoded', decoded);
      req.decoded = decoded;
      next();
    });
    
}

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
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        res.send({token});
      })

      // read all data ////////////////////////////////////////////////////
      app.get('/inventories', async(req, res) => {
        // console.log('query', req.query);
        // const page = parseInt(req.query.page);
        // const size = parseInt(req.query.size);
        const query = {};
        const cursor = inventoryCollection.find(query);
        // let items;
        // if(page || size){
        //   items = await cursor.skip(page*size).toArray();
        // }
        // else{
        //   
        // }
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

      //pagination ////////////////////////////////////
      app.get('/inventoryCount', async(req, res) => {
        const query = {};
        const cursor = inventoryCollection.find(query);
        const count = await cursor.count();
        res.send({count});
      })

      ///////////////////////////////////////////////////////////////

      // create data /////////////////////////////////////
      app.post('/inventoryAdd', async (req, res) => {
        const newInventory = req.body;
        const result = await inventoryCollection.insertOne(newInventory);
        res.send(result);
        console.log("inventory add success");
      })

      //////////////////////////////////////////////////////////////////

      // item collection //////////////////////////////////////////
      app.get('/item', verifyJWT, async(req, res) => {
        const decodedEmail = req.decoded.email;
        const email = req.query.email;
        if(email === decodedEmail){
          const query = {email: email};
          const cursor = itemCollection.find(query);
          const items = await cursor.toArray();
          res.send(items);
        }
        else{
          res.status(403).send({message: 'Forbidden access'})
        }
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