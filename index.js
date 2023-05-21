const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eiraya6.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const toysCollection = client.db('toysAssignment').collection('toysshop');

        const addToysCollection = client.db('toysAssignment').collection('addtoys')


        app.get('/toysshop', async (req, res) => {
            const cursor = toysCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toysshop/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                toys: [
                    {
                        _id: id
                    }
                ]
            }
            const result = await toysCollection.find().toArray();
            const toys = []
            for (let data of result) {
                toys.push(data.toys[0])
                toys.push(data.toys[1])
            }
            // console.log(result);
            // console.log(toys);

            const toy = toys.find(item => item._id === id)

            res.send(toy);

        });


        // search toy
        const indexKeys = { name: 1 };
        const indexOptions = { toyName: "toyName" };

        const result = await addToysCollection.createIndex(indexKeys, indexOptions);

        app.get('/toySearchByTitle/:text', async (req, res) => {
            const searchToy = req.params.text;

            const result = await addToysCollection.find({
                $or: [
                    { name: {$regex: searchToy, $options: "i"}},
                ]
            }).toArray();

            res.send(result);
        })


        // all toys

        // app.get('/addtoys', async (req, res) => {
        //     const cursor = addToysCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        // my toys

        app.get('/addtoys', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await addToysCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/addtoys', async (req, res) => {
            const addToys = req.body;
            console.log(addToys);
            const result = await addToysCollection.insertOne(addToys);
            res.send(result)
        })

        app.get('/addtoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addToysCollection.findOne(query);
            res.send(result);
        })

        app.put('/addtoys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToys = req.body;
            const toys = {
                $set: {
                    photo: updatedToys.photo,
                    name: updatedToys.name,
                    price: updatedToys.price,
                    quantity: updatedToys.quantity
                }
            }
            const result = await addToysCollection.updateOne(filter, toys, options);
            res.send(result);
        })

        app.delete('/addtoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addToysCollection.deleteOne(query)
            res.send(result)
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


app.get('/', (req, res) => {
    res.send('animal toys are running')
})

app.listen(port, () => {
    console.log(`Animal Toys Server is running on port ${port}`);
})