const express = require("express");
const { MongoClient } = require("mongodb");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const app = express();
const port = 3000; // Replace this with your desired port number

// MongoDB setup and connection
let notes;

(async () => {
  const client = new MongoClient("mongodb://localhost:27017");
  try {
    await client.connect();
    const db = client.db("tutor");
    notes = db.collection("notes");
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
})();

// Middleware to parse JSON data in the request body
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description: "A simple API to manage notes",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Note: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            content: {
              type: "string",
            },
          },
        },
      },
    },
  },
  apis: ["./app.js"], // Replace "app.js" with the actual filename of your main Node.js file
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Retrieve all notes
 *     description: Get a list of all notes.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Note"
 */
app.get("/notes", async function(req, res) {
  try {
    let cursor = await notes.find(req.query);
    let items = await cursor.toArray();
    res.send(items);
  } catch (err) {
    console.error("Error retrieving notes:", err);
    res.status(500).send("An error occurred while retrieving notes.");
  }
});

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     description: Create a new note with the given title and content.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Note"
 *     responses:
 *       200:
 *         description: Successful operation
 */
app.post("/notes", async function(req, res) {
  try {
    await notes.insertOne(req.body);
    res.send("Note added successfully.");
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).send("An error occurred while adding a note.");
  }
});

let ObjectId = require('mongodb').ObjectId;

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     description: Deletes a note based on its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the note to be deleted.
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Note not found
 */
app.delete("/notes/:id", async function(req,res) {
    let id = new ObjectId(req.params.id);
    const result = await notes.deleteOne({_id: id})
    if (result.deletedCount === 1) {
        res.send({ok:true});
    } else {
        res.send({ok:false});
    }
});

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     description: Update an existing note with the given ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the note to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Note"
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Note not found
 */
app.put("/notes/:id", async function(req, res) {
  try {
    let id = new ObjectId(req.params.id);
    const result = await notes.updateOne({ _id: id }, { $set: req.body });
    if (result.matchedCount === 1) {
      res.send("Note updated successfully.");
    } else {
      res.status(404).send("Note not found.");
    }
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).send("An error occurred while updating the note.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
