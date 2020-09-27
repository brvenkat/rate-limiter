# Rate Limiter API
This API has a middleware that limits the number of requests that can be made to the API


## Details
This API is an express API running in docker container which exposes the root endpoint. This endpoint runs a middleware that does the rate limiting. It is written in Typescript and uses Redis Cache. Unit tests are added using Jest

## Setup
The requirement is to just have docker, node, npm installed in the users machine. The docker container pulls down the redis image

## Running
Clone the directory and then run `docker-compose up --build` , it will start up the application on port 8080. Navigate `localhost:8080`. Currently the hourly limit is set to 2 requests per hour to simplify and validate the testing. Once you hit the URL for first time , you will
see a `Request Accepted` message on your browser. After 100 requests you will get a message similar to `Rate limit exceeded. Try again in 291 seconds.` on your browser. The numeric value will depend on when you hit the API. Screenshots are attached. If you want to change the values 
of number of requests per hour, navigate to `docker-compose.yml` and look for `MAX_REQUESTS` value and change it. The max requests need not be an hourly limit and you can change the `TIME_INTERVAL` value in docker-compose file to whatever hours you want.

## Unit Testing
Run `npm test` from main directory and it will run all jest tests

## Tech Stack
Typescript
Docker
Redis
Express
Jest

## Middleware
The middleware is located at https://github.com/brvenkat/rate-limiter/blob/master/src/middlewares/rateLimiter.ts

## Core Logic of RateLimiter
The number of requests are maintained in Redis cache based on request IP address and timestamp
The rate limiter middleware uses the concept of sliding one hour windows instead of a fixed one to throttle requests. The issue with fixed one hour window is irregular hits to the server.
Consider the scenario of 100 requests limit from time 0 to time 60.The server could be hit with requests from 55th to 60th minute and then again from 61st to 66th minute with 100 requests and server could be overloaded in these 10 minutes. This can impact server performance in that time.The sliding window takes the current request time and looks for number of requests in the last one hour and throttles requests based on count in that one hour. It does so by dividing the 60 minutes into time slots of x minutes each (variable `INDIVIDUAL_TIME_SLOT` in docker-compose). The reason for dividing into time slots is because we do not want to create new entry for every request into redis and affect memory usage. With this approach, once a request comes in we first check if an entry exists in cache for that IP, if not, entry is added to cache for that IP and request proceeds. If entry exists for that IP, we check the request timestamp and grab the latest timeslot in cache. If the request timestamp falls in the latest time slot, the count of latest timestamp is incremented else a new entry is created for that timestamp with count set to 1. If the number of requests in the past 1 hour exceeds maximum allowed, the rate limiter sends back status of 429 with custom text message.

## Assumption
Assumed that time limit set in config is in hours and the individual time slots is in minutes. It is easy to fix this by adding another
config to specify the time units.

## Limitations
There are couple of things that can be optimized
1. Add environment variables into AWS/Cloud and read the values from AWS. 
2. Data can be added into cache in a sorted way and we need not sort it everytime.