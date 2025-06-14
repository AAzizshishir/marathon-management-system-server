const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("");
  res.send("Marathon Server is running...");
});
console.log(process.env.db_marathon);
console.log(process.env.db_password);

const uri = `mongodb+srv://${process.env.db_marathon}:${process.env.db_password}@cluster0.pacddgd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const marathonCollection = client
      .db("marathon")
      .collection("marathonCollection");

    const registrationsCollection = client
      .db("marathon")
      .collection("registration");

    app.get("/allMarathons", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await marathonCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allMarathons/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await marathonCollection.findOne(query);
      res.send(result);
    });

    app.get("/marathons", async (req, res) => {
      const result = await marathonCollection.find().limit(6).toArray();
      res.send(result);
    });

    app.post("/marathons", async (req, res) => {
      const marathons = req.body;
      const result = await marathonCollection.insertOne(marathons);
      res.send(result);
    });

    app.put("/allMarathons/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateMarathon = req.body;
      const updatedDoc = {
        $set: updateMarathon,
      };
      const result = await marathonCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/allMarathons/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await marathonCollection.deleteOne(query);
      res.send(result);
    });

    // Registration Api

    app.get("/registration", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await registrationsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/registration", async (req, res) => {
      const registration = req.body;
      const result = await registrationsCollection.insertOne(registration);
      res.send(result);
    });

    app.put("/registration/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: updatedData,
      };
      const result = await registrationsCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    app.delete("/registration/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await registrationsCollection.deleteOne(query);
      res.send(result);
    });

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

app.listen(port, () => {
  console.log("Port is running on port", port);
});
