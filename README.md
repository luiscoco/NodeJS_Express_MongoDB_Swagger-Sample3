# How to create a simple CRUD server with NodeJS + Express + MongoDB (with Swagger OpenAPI docs)

## 1. How to run the MongoDB Docker container

First of all, do not forget to **run Docker Desktop** before pulling and running the MondoDb Docker container

Download the MongoDB docker container with the command:

```
docker pull mongo
```

and after downloading the MongoDB container then execute it with the command:

```
docker run -d -p 27017:27017 --name MongoDB mongo
```

![image](https://github.com/luiscoco/NodeJS_Express_MongoDB_Swagger-Sample3/assets/32194879/3059a48b-6ab9-47ee-9f3e-9447749b264f)

![image](https://github.com/luiscoco/NodeJS_Express_MongoDB_Swagger-Sample3/assets/32194879/e5247505-be44-462e-bfe8-3d40d595bf4c)

## 2. Project folders and files structure

![image](https://github.com/luiscoco/NodeJS_Express_MongoDB_Swagger-Sample3/assets/32194879/9a4b8dc5-d8c2-4281-ae31-00f9d9c2e348)

## 3. Project dependencies/libraries

These are the dependecies required in this project: 

- **express**: Express is a fast, unopinionated, minimalist web framework for Node.js. It is designed **for building web applications and APIs**. It is the de facto standard server framework for Node.js. In our application, Express is used to **set up the server**, **define routes**, and **handle HTTP requests and responses**.

- **mongodb**: This is the official MongoDB Node.js driver. It allows you **to connect to your MongoDB database** and perform various database operations like queries, inserts, updates, and deletes directly from your Node.js application. In the given application code, the MongoDB driver is used to connect to a MongoDB database, allowing operations on the database such as adding, retrieving, updating, and deleting notes.

- **swagger-jsdoc**: This package integrates Swagger with JSDoc comments in your code to **automatically generate an OpenAPI specification** (formerly known as Swagger) . This spec can then be used to generate documentation for your API or to drive tooling that consumes OpenAPI. It's used in our project to read **JSDoc-annotated** source code and generate an OpenAPI specification. This specification is what swagger-ui-express uses to render your API documentation.

- **swagger-ui-express**: This package allows you **to serve auto-generated swagger-ui generated API docs** from express, based on a swagger.json file or the swagger-jsdoc output. It makes your API documentation accessible via a web interface, providing a visual and interactive API documentation. In our application, this package is used to serve the Swagger UI bound to the API documentation generated from your code by swagger-jsdoc. This is what enables you to visit /api-docs in your browser to see the documentation for your API. 

Each of these dependencies plays a crucial role in the functionality of your application, from creating the server and handling requests (**express**), interacting with a MongoDB database (**mongodb**), and generating and serving API documentation (**swagger-jsdoc** and **swagger-ui-express**).

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

This code is a Node.js application using Express, MongoDB, and Swagger for creating a simple REST API to manage notes. Here's a breakdown of its main components and functionalities:

### 4.1. Setting Up Dependencies

The code begins by importing necessary libraries:

**express** for the web server framework

**mongodb** to interact with MongoDB database

**swagger-ui-express** and **swagger-jsdoc** for documenting the API using Swagger

```javascript
const express = require("express");
const { MongoClient } = require("mongodb");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
```

### 4.2. Express App Initialization

An Express application is created, and a port number is defined for the server to listen on

```javascript
const app = express();
```

### 4.3. MongoDB Connection

It establishes a connection to MongoDB using the MongoClient from the mongodb package

The database used is "**tutor**", and it operates on a collection named "**notes**"

This connection is asynchronous and uses an immediately invoked function expression (IIFE) to handle the connection logic

```javascript
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
```

We can verify the MondoDb database with **Studio 3T Free for MongoDb**

![image](https://github.com/luiscoco/NodeJS_Express_MongoDB_Swagger-Sample3/assets/32194879/438f8339-e792-4a71-b04c-e931059681ff)

### 4.4. Middleware

The application uses express.json() middleware to parse JSON-formatted request bodies, making it easy to handle JSON data sent in requests

```javascript
// Middleware to parse JSON data in the request body
app.use(express.json());
```

### 4.5. Swagger Configuration

The Swagger documentation is set up using **swagger-jsdoc** and **swagger-ui-express** 

The configuration specifies the API's information, such as its title, version, and description, and it also defines the schema for a Note object

The API's routes are included in the documentation using a relative path to the file (in this example, "./app.js"), which should be updated to match the actual filename

```javascript
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
```

### 4.6. API Endpoints

The application defines several routes for managing notes:

**GET /notes**: Retrieves all notes from the database. It queries the MongoDB collection and returns the results

**POST /notes**: Allows the creation of a new note by inserting the provided data into the MongoDB collection

**DELETE /notes/:id**: Deletes a note identified by its unique ID from the MongoDB collection

**PUT /notes/:id**: Updates an existing note identified by its unique ID with the provided data

Each of these routes includes **Swagger annotations** to document the endpoint, describing its purpose, request parameters, and the structure of request and response bodies

```javascript
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
```

### 4.7. Error Handling

The application includes basic error handling for database operations, logging errors to the console and sending error responses to the client.

### 4.8. Starting the Server

Finally, the application listens on the defined port, and upon successful launch, logs a message indicating the server is running

This application serves as a basic backend for managing notes, with the added benefit of having its API documented and testable via Swagger UI

The Swagger documentation is accessible by navigating to /api-docs on the running server, providing an interactive interface for trying out the API endpoints

```javascript
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

### 4.9. Application Source Code

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

After running the application we can navigate to the Swagger OpenAPI docs: http://localhost:3000/api-docs/#/

![image](https://github.com/luiscoco/NodeJS_Express_MongoDB_Swagger-Sample3/assets/32194879/039a10a5-d84c-485b-87b2-2140712bc55a)

We can create a new item in the database sending a POST request:

![image](https://github.com/luiscoco/NodeJS_Express_MongoDB_Swagger-Sample3/assets/32194879/4e21c46b-de82-4d14-969d-6064fa10b819)

Also we can see the elements in the database with ta GET request:


