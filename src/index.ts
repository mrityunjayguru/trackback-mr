//import express, { Application } from 'express';
//import http from 'http';  // To create a server with HTTP support
//import config from 'config';
//import db from './startup/db';
//import errorHandler from './startup/error';
//import models from './startup/models';
//import routes from './startup/router';
//import { scheduleTask } from './helper/Scheduler';
// import { setupSocket } from './socket';  // Import the socket setup function

//const app: Application = express();

// Creating the HTTP server with Express
//const server = http.createServer(app);

// Set up Socket.IO
// setupSocket(server);

//db();
//models();
//routes(app);
//errorHandler();
//scheduleTask();

//const port = process.env.PORT || config.get('port');

// Start the server with Socket.IO
//server.listen(port, () => {
//  console.log(`Connected on port ${port}`);
//});

//server.listen(port, '0.0.0.0', () => {  // Bind to all interfaces
// console.log(`Connected on port ${port}`);
//});


import express, { Application } from 'express';



import http from 'http';  // To create a server with HTTP support

import config from 'config';

import cors from 'cors';  // Import the CORS middleware

import db from './startup/db';

import errorHandler from './startup/error';

import models from './startup/models';

import routes from './startup/router';

import { scheduleTask } from './helper/Scheduler';


const app: Application = express();


// CORS Configuration

const allowedOrigins = [

  'http://app.trackroutepro.com',  // Your main frontend domain

  'http://3.108.155.90:5173',      // Add your local development frontend IP

];


const corsOptions = {

  origin: function (origin, callback) {

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {

      callback(null, true);

    } else {

      callback(new Error('Not allowed by CORS'));

    }

  },

  methods: ['GET', 'POST', 'PUT', 'DELETE'],

  allowedHeaders: ['Content-Type', 'Authorization'],

};


// Enable CORS with the specified options

app.use(cors(corsOptions));

// Handle preflight requests (OPTIONS) for all routes
app.options('*', cors(corsOptions));  // Enable CORS for all routes


// Creating the HTTP server with Express

const server = http.createServer(app);


db();

models();

routes(app);

errorHandler();

scheduleTask();


const port = process.env.PORT || config.get('port');



// Start the server

server.listen(port, '0.0.0.0', () => {  // Bind to all interfaces

  console.log(`Server is connected on port ${port}`);

});


// Start the server

server.listen(port, '0.0.0.0', () => {  // Bind to all interfaces

  console.log(`Server is connected on port ${port}`);

});
