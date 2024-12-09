const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t08r2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const keyboardCollection = client.db("keyboardDB").collection("keyboards");
    const usersCollection = client.db("keyboardDB").collection("users");

    app.get("/keyboards", async (req, res) => {
      const cursor = keyboardCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/keyboards/featured", async (req, res) => {
      const cursor = keyboardCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/keyboards/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await keyboardCollection.findOne(query);
      res.send(result);
    });

    app.get("/myKeyboards/:email", async (req, res) => {
      const user_email = req.params.email;

      const query = { email: user_email };
      const cursor = keyboardCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/keyboards", async (req, res) => {
      const newKeyboard = req.body;
      // console.log(newKeyboard);

      const result = await keyboardCollection.insertOne(newKeyboard);
      res.send(result);
    });

    app.put("/keyboards/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedKeyboard = req.body;
      const keyboard = {
        $set: {
          name: updatedKeyboard.name,
          color: updatedKeyboard.color,
          switchType: updatedKeyboard.switchType,
          layout: updatedKeyboard.layout,
          connection: updatedKeyboard.connection,
          price: updatedKeyboard.price,
          photo: updatedKeyboard.photo,
        },
      };

      const result = await keyboardCollection.updateOne(
        filter,
        keyboard,
        options
      );

      res.send(result);
    });

    app.delete("/keyboards/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await keyboardCollection.deleteOne(query);
      res.send(result);
    });

    // users apis
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      // console.log(newUser);

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedDoc = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime,
        },
      };

      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
