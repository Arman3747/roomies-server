const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// app.use(cors());
// app.use(cors({ origin: 'https://fascinating-sunflower-cfec7f.netlify.app' }));

const allowedOrigin = [
  "https://fascinating-sunflower-cfec7f.netlify.app",
  "http://localhost:5173",
];
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.nnagfsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const uri = `mongodb+srv://${process.env.roomies_DB_USER}:${process.env.roomies_DB_PASS}@cluster0.nnagfsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const roommatesCollection = client.db("roomies").collection("roommates");

    //Read
    app.get("/roommates", async (req, res) => {
      const result = await roommatesCollection.find().toArray();
      res.send(result);
    });

    //Read 1 Room
    app.get("/roommates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roommatesCollection.findOne(query);
      res.send(result);
    });

    //Create
    app.post("/roommates", async (req, res) => {
      const newRoommate = req.body;
      // console.log(newRoommate);
      const result = await roommatesCollection.insertOne(newRoommate);
      res.send(result);
    });

    //update
    app.put("/roommates/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedRoom = req.body;
      const updatedDoc = {
        $set: updatedRoom,
      };
      const result = await roommatesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //patch
    app.patch("/roommates/:id", async (req, res) => {
      console.log(req.body);
      const id = req.params.id;

      const { likeCount, likedUsers } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          likeCount: likeCount,
          likedUsers: likedUsers,
        },
      };
      const result = await roommatesCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //Delete
    app.delete("/roommates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roommatesCollection.deleteOne(query);
      res.send(result);
    });

    // //dashboard
    // app.get("/dashboard", async (req, res) => {
    //   const userEmail = req.query.email;
    //   if (!userEmail)
    //     return res.status(400).json({ error: "Email is required" });

    //   try {
    //     // Fetch all posts created by the user
    //     const userPosts = await roommatesCollection
    //       .find({ email: userEmail })
    //       .toArray();

    //     const totalPosts = userPosts.length;
    //     const totalLikes = userPosts.reduce(
    //       (sum, post) => sum + (post.likeCount || 0),
    //       0
    //     );

    //     res.json({ totalPosts, totalLikes });
    //   } catch (err) {
    //     console.error("Error fetching stats", err);
    //     res.status(500).json({ error: "Internal server error" });
    //   }
    // });

    //dashboard-stats
    app.get("/dashboardStats", async (req, res) => {
      const userEmail = req.query.email;
      if (!userEmail)
        return res.status(400).json({ error: "Email is required" });

      try {
        const posts = await roommatesCollection.find({ email: userEmail }).toArray();
        const totalPosts = posts.length;

        let totalLikes = 0;
        let totalInterestedUsers = 0;
        let rentSum = 0;
        let mostLikedPost = null;

        posts.forEach((post) => {
          const likes = post.likeCount || 0;
          const interested = (post.likedUsers || []).length;
          const rent = parseFloat(post.rent) || 0;

          totalLikes += likes;
          totalInterestedUsers += interested;
          rentSum += rent;

          if (!mostLikedPost || likes > mostLikedPost.likeCount) {
            mostLikedPost = { title: post.title, likeCount: likes };
          }
        });

        const averageRent = totalPosts ? Math.round(rentSum / totalPosts) : 0;

        res.json({
          totalPosts,
          totalLikes,
          totalInterestedUsers,
          averageRent,
          mostLikedPost: mostLikedPost?.title || "",
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("Room is empty !");
});

app.listen(port, () => {
  console.log(`roomies server is running in port ${port}`);
});
