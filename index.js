const { MongoClient } = require("mongodb");

// Connection to the mongodb
const uri = "mongodb+srv://slavkostevic:nZ2mYYjxyJzQvaVe@phase2.wdyjvvd.mongodb.net/test";

const express = require("express");
const app = express();
const port = 3000;
var fs = require("fs");

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const js2xmlparser  = require("js2xmlparser"); //JSON to XML
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); //fetch
//for some reason it didnt let me import fetch properly because the file is .js and it requires .mjs - this solves the problem

const xml2jsparser  = require("express-xml-bodyparser"); //XML to JSON
app.use(xml2jsparser({ normalizeTags: false })); // normalize tags would put everything to lower case and cause problems
const request = require('request'); //Request

//Open the Menu
//Menu shows us POST or PUT buttons that will take us to one of those two forms
app.get('/menu', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('./menu.html', 'utf8', (err, contents) => {
      if(err) {
          console.log('Form file Read Error', err);
          res.write("<p>Form file Read Error");
      } else {
          console.log('Form loaded\n');
          res.write(contents + "<br>");
      }
      res.end();
    });
});

// GET All tickets

app.get("/rest/list/", function(req, res){
    //establish the new connection with the mongodb
    const client = new MongoClient(uri);

    async function run() {
        try {
            const database = client.db("tickets");
            const ticketDb = database.collection("Ticket Collection");
        
            const query = {}; //this means that all tickets are selected
        
            //tickets is an array that holds all tickets that are of type JSON
            const tickets = await ticketDb.find(query).toArray(); 
            //if array is 0 there's no tickets
            if (tickets.length === 0) {
                res.status(404).send("Tickets do not exist!");
            } else {
                console.log(tickets);
                //return the tickets
                res.json(tickets);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Error!");
        }finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
});

// GET ticket by id // ADAPTEE

app.get("/rest/ticket/:ticketId", function(req, res) {
    const client = new MongoClient(uri);
    //search key is what we are looking for in the database JSON
    //it needs to match the field "ticketID" and to match the value of that field
    const searchKey = "ticketID: '" + req.params.ticketId + "'";
    console.log("Looking for: " + searchKey);

    async function run() {
        try {
            const database = client.db("tickets");
            const ticketDb = database.collection("Ticket Collection");
      
            const query = { ticketID: req.params.ticketId };
      
            //find the ticket and store it in "ticket"
            const ticket = await ticketDb.findOne(query);
            //checking if ticket exists
            if (ticket === null) { //it's null when it doesn't exist
                res.status(404).send("Ticket does not exist!");
            } else {
                console.log(ticket);
                //return the ticket
                res.json(ticket);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Error!")
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
});

// A DELETE request

app.delete("/rest/ticket/:ticketId", function(req, res) {
    const client = new MongoClient(uri);
    //search key is what we are looking for in the database JSON
    //it needs to match the field "ticketID" and to match the value of that field
    const searchKey = "ticketID: '" + req.params.ticketId + "'";
    console.log("Looking for: " + searchKey);

    async function run() {
        try {
            const database = client.db("tickets");
            const ticketDb = database.collection("Ticket Collection");
      
            const query = { ticketID: req.params.ticketId };
      
            //find the ticket and delete it
            const deleteTicket = await ticketDb.deleteOne(query);
            //checking if we deleted the ticket
            if (deleteTicket.deletedCount === 0) {
                res.status(404).send("Ticket does not exist!");
            } else {
                console.log(deleteTicket);
                res.status(200).send(`Ticket with ticketID: ${req.params.ticketId} has been deleted!`);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Error!")
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
});

// A POST request

app.get('/postform', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('./post.html', 'utf8', (err, contents) => {
      if(err) {
          console.log('Form file Read Error', err);
          res.write("<p>Form file Read Error");
      } else {
          console.log('Form loaded\n');
          res.write(contents + "<br>");
      }
      res.end();
    });
  });

app.post("/rest/ticket/postTicket", function(req, res) {
    const client = new MongoClient(uri);

    async function run() {
        try {
            const database = client.db("tickets");
            const ticketDb = database.collection("Ticket Collection");

            const ticketID = req.body.ticketID;
            const created_at = req.body.created_at;
            const updated_at = req.body.updated_at;
            const type = req.body.type;
            const subject = req.body.subject;
            const description = req.body.description;
            const priority = req.body.priority;
            const status = req.body.status;
            const recipient = req.body.recipient;
            const submitter = req.body.submitter;
            const assignee_id = req.body.assignee_id;
            const follower_ids = req.body.follower_ids;
            const tags = req.body.tags;

            //creating the ticket of type JSON
            const ticket = {
                ticketID: ticketID,
                created_at: created_at,
                updated_at: updated_at,
                type: type,
                subject: subject,
                description: description,
                priority: priority,
                status: status,
                recipient: recipient,
                submitter: submitter,
                assignee_id: assignee_id,
                follower_ids: follower_ids,
                tags: tags
            };

            //here we don't handle much errors because all fields are pre-filled so if a mistake has been made
            //the ticket should be deleted and then added again
            const addTicket = await ticketDb.insertOne(ticket);
            console.log(addTicket);
            res.json(ticket);
        } catch (err) {
            console.log(err);
            res.status(500).send("Error!")
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
});

// A PUT request // ADAPTEE

app.get('/putform', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('./put.html', 'utf8', (err, contents) => {
      if(err) {
          console.log('Form file Read Error', err);
          res.write("<p>Form file Read Error");
      } else {
          console.log('Form loaded\n');
          res.write(contents + "<br>");
      }
      res.end();
    });
  });

app.post("/rest/ticket/updateTicket", function(req, res) {
    const client = new MongoClient(uri);
    async function run() {
        try {
            const database = client.db("tickets");
            const ticketDb = database.collection("Ticket Collection");

            const ticketID = req.body.ticketID;
            const created_at = req.body.created_at;
            const updated_at = req.body.updated_at;
            const type = req.body.type;
            const subject = req.body.subject;
            const description = req.body.description;
            const priority = req.body.priority;
            const status = req.body.status;
            const recipient = req.body.recipient;
            const submitter = req.body.submitter;
            const assignee_id = req.body.assignee_id;
            const follower_ids = req.body.follower_ids;
            const tags = req.body.tags;

            //creating the ticket of type JSON
            const ticket = {
                ticketID: ticketID,
                created_at: created_at,
                updated_at: updated_at,
                type: type,
                subject: subject,
                description: description,
                priority: priority,
                status: status,
                recipient: recipient,
                submitter: submitter,
                assignee_id: assignee_id,
                follower_ids: follower_ids,
                tags: tags
            };

            //Here we put the ticketID into the field and then fill out rest of the fields
            //Then findOneAndUpdate searches for that ticketID  and if found -> $set updates the whole ticket
            //if not we throw an error
            const updateTicket = await ticketDb.findOneAndUpdate({ ticketID: ticketID }, { $set: ticket });
            if (!updateTicket) {
                //this is included just to make sure we don't get errors when res.send occurs
                //it happens because we call this rout in the other POST method and that method can handle only 1 res.send at a time
                if (!res.headersSent) {
                    res.status(404).send("Ticket does not exist!");
                }
                //res.status(404).send("Ticket does not exist!");
            } else {
                console.log(updateTicket);
                res.json(ticket);
                if (!res.headersSent) {
                    res.status(200).send(`Ticket with ticketID: ${ticketID} has been updated!`);
                }
                //res.status(200).send(`Ticket with ticketID: ${ticketID} has been updated!`);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Error!")
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
});

// GET ticket by id // ADAPTOR

//Gets JSON by calling /rest/ticket/:ticketId, returns XML
app.get("/rest/xml/ticket/:ticketId", function(req, res) {
    //search key is what we are looking for in the database JSON
    //it needs to match the field "ticketID" and to match the value of that field
    const searchKey = req.params.ticketId;
    console.log("Looking for XML: " + searchKey);

    async function run() {
        try {
            //try to fetch the ticket
            const response = await fetch(`http://localhost:3000/rest/ticket/${searchKey}`);

            if (!response.ok) { //if fetch didn't work (response was not okay)
                res.send("Ticket could not be retrieved!");

            } else { //the ticket exists + there was no errors
                //store the ticket as JSON
                const ticketJSON = await response.json();
                //parsing the JSON
                const ticketXML = js2xmlparser.parse("ticket", ticketJSON);
                
                //return the ticket
                res.send(ticketXML);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Error!")
        }
    }
    run().catch(console.dir);
});

// PUT ticket by id // ADAPTOR

app.post("/rest/xml/ticket/updateTicket/", function(req, res) {
    async function run() {
        try {
            const ticketXML = req.body;

            //extracting the XML body fields
            const obj = {};
            for (const a in ticketXML.ticket) {
                obj[a] = ticketXML.ticket[a][0];
            }
            
            const ticketString = JSON.stringify(obj); //obj is of type obj so we need to stringify it
            const ticketJSON = JSON.parse(ticketString); //once its a string we parse it to JSON

            //request options - we are passing ticketJSON because our /rest/ticket/updateTicket accepts JSON's
            const options = {
                url: "http://localhost:3000/rest/ticket/updateTicket",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: true,
                body: ticketJSON
            };

            request(options, (err2) => {
                if (err2) {
                    //if request didn't work for some reason we throw an error
                    res.status(500).send("Error!");
                } else {
                    //code 200 for success
                    res.status(200).send("Ticket has been updated!");
                }
            });
        } catch (err) {
            console.log(err);
            res.status(500).send("Error!")
        }
    }
    run().catch(console.dir);
});