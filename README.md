# NodeJS_Express_MongoDB_Swagger-Sample3

## 1. How to run the MongoDB docker container

Download the MongoDB docker container with the command:

```
docker pull mongo
```

and after downloading the MongoDB container then execute it with the command:

```
docker run -d -p 27017:27017 --name MongoDB mongo
```

## 2. Project folders and files structure

![image](https://github.com/luiscoco/NodeJS_Express_MongoDB_Swagger-Sample3/assets/32194879/9a4b8dc5-d8c2-4281-ae31-00f9d9c2e348)

## 3. Project dependencies/libraries

These are the dependecies required in this project: 

- **express**: Express is a fast, unopinionated, minimalist web framework for Node.js. It is designed **for building web applications and APIs**. It is the de facto standard server framework for Node.js. In our application, Express is used to **set up the server**, **define routes**, and **handle HTTP requests and responses**.

- **mongodb**: This is the official MongoDB Node.js driver. It allows you **to connect to your MongoDB database** and perform various database operations like queries, inserts, updates, and deletes directly from your Node.js application. In the given application code, the MongoDB driver is used to connect to a MongoDB database, allowing operations on the database such as adding, retrieving, updating, and deleting notes.

- **swagger-jsdoc**: This package integrates Swagger with JSDoc comments in your code to **automatically generate an OpenAPI specification** (formerly known as Swagger) . This spec can then be used to generate documentation for your API or to drive tooling that consumes OpenAPI. It's used in our project to read **JSDoc-annotated** source code and generate an OpenAPI specification. This specification is what swagger-ui-express uses to render your API documentation.

- **swagger-ui-express**: This package allows you **to serve auto-generated swagger-ui generated API docs** from express, based on a swagger.json file or the swagger-jsdoc output. It makes your API documentation accessible via a web interface, providing a visual and interactive API documentation. In our application, this package is used to serve the Swagger UI bound to the API documentation generated from your code by swagger-jsdoc. This is what enables you to visit /api-docs in your browser to see the documentation for your API. 

**package.json**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^5.7.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  }
}
```

## 4. Source code explained

**app.js**

```javascript
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
```

## 3. How to Run the application

Install the project dependencies derfined in the **package.json** file

```
npm install
```

or 

```
npm i
```

Run the application with the following command:

```
node app.js
```


