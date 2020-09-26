import express from "express";
import { connect } from './redis/redisClient'
import { rateLimiter } from './middlewares/rateLimiter'
const app = express();
const port = 8080; // default port to listen

app.get( "/", rateLimiter, ( _req, res ) => res.send( "Request Accepted " ));

// start the Express server
export let server = app.listen( port, async () => {
    await connect();
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
