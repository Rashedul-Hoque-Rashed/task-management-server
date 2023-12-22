const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: ['http://localhost:5173',
],
    credentials: true
}));
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


const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const taskCollections = client.db('taskDb').collection('tasks');

        app.get('/tasks', verifyToken, async (req, res) => {
            const result = await taskCollections.find().toArray();
            res.send(result)
        })

        app.get('/tasks/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }
            const result = await taskCollections.find(query).toArray();
            res.send(result)
        })

        app.get('/tasks/update/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollections.find(query).toArray();
            res.send(result)
        })

        app.delete('/tasks/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await taskCollections.deleteOne(query);
            res.send(result)
        })

        app.put("/update/:id", verifyToken, async (req, res) => {
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

        app.post('/tasks', verifyToken, async (req, res) => {
            const task = req.body;
            const result = await taskCollections.insertOne(task);
            res.send(result)
        })

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true });
        })

        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
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