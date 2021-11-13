const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;


//middleware

app.use(cors());
app.use(express.json());


//connect to db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ctn6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {

    await client.connect();
    console.log('connected to db');

    const database = client.db('Baby_Care');
    const productCollection = database.collection('products');
    const userCollection = database.collection('users');
    const reviewCollecton = database.collection('reviews');
    const orderCollection = database.collection('orders')

    //get all products

    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // add products in product collection

    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result)
    });

    // add ordered product to orderCollection

    app.post('/orders', async (req, res) => {
      const orderedProduct = req.body;
      console.log('orderedProduct', orderedProduct)
      const result = await orderCollection.insertOne(orderedProduct);
      console.log(result);
      res.send(result)

    });

    app.get('/orders', async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders)
    });

    // delete single order from  order collection

    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })


    //add review in review collection

    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollecton.insertOne(review);
      res.send(result)
    });


    // get reviews for home page

    app.get('/reviews', async (req, res) => {
      const cursor = reviewCollecton.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    // add user to db
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result)
    });

    //update or upsert user as admin
    app.put('/users', async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: 'Admin'
        }
      }

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    });

    // get user in order to check the user is admin or not;

    app.get('/users', async (req, res) => {

      const query = { email: req.query.email };
      const user = await userCollection.findOne(query);

      res.send(user)

    })


  }
  catch {
    // await client.close()
  }

}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('assignment-12 server is running!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
