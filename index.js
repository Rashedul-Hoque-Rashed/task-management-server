const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());
app.use(cookieParser());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@taskmanagements.oskwslv.mongodb.net/?retryWrites=true&w=majority`;

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

        const taskCollections = client.db('taskDb').collection('tasks');

        app.get('/tasks', async (req, res) => {
            const result = await taskCollections.find().toArray();
            res.send(result)
        })

        app.get('/tasks/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }
            const result = await taskCollections.find(query).toArray();
            res.send(result)
        })

        app.get('/tasks/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollections.find(query).toArray();
            res.send(result)
        })

        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await taskCollections.deleteOne(query);
            res.send(result)
        })

        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            const task = req.body;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updateTask = {
              $set: {
                title: task.title,
                deadline: task.deadline,
                priority: task.priority,
                description: task.description,
              }
            }
            const result = await taskCollections.updateOne(filter, updateTask, options);
            res.send(result);
          })

        app.put("/tasks/status/:id", async (req, res) => {
            const id = req.params.id;
            const task = req.body;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updateTask = {
              $set: {
                status: task.status,
              }
            }
            const result = await taskCollections.updateOne(filter, updateTask, options);
            res.send(result);
          })

        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollections.insertOne(task);
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
    res.send('task management is running')
})

app.listen(port, () => {
    console.log(`task management is running on PORT: ${port}`)
})