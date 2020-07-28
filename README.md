# Table of Contents

1. [Discovery Service](#discovery-service)
2. [Description](#description)
3. [Specs](#specs)
4. [Storage](#storage)
5. [Deviations](#deviations)
6. [Installation](#installation)
7. [API commands example](#api-commands-example)
8. [Sweeper](#sweeper)
9. [Notes](#notes)

# Discovery Service

Discovery service written in Typescript for keeping track of registered applications and to remove them once they're expired (no heartbeat in a certain time frame).

# Description

The application is composed by two main components:

* `app` that serves requests.
* `sweeper` that checks constantly for expired applications, and removes them in case.

# Specs

* Typescript v3.9.7
* NodeJS v12.4.0
* Express v4.17.1 (handler and routing)
* LokiJS v1.5.9 (storage)
* Ajv v6.12.3 (json schema validation for payloads)
* Mocha, chai, sinon and nyc for unit testing
* Supertest for express testing

# Storage

For managing applications data, we use [LokiJS](https://github.com/techfort/LokiJS), a document-oriented DBMS that allows to persist data in memory, or in another fashion with the proper adapter. The information is stored in a file, `application.db.json` . For unit testing, the information is stored in `test.db.json` .

# Deviations

Applications optionally can attach some meta information upon registration. Ideally, the payload would be a JSON like:

``` js
{
    "meta": {
        "foo": 1
    }
}
```

For versioning reasons, LokiJS already set a `meta` properties for the items. To avoid confusion, we use `metadata` instead:

``` js
{
    "metadata": {
        "foo": 1
    }
}
```

# Installation

First of all, open a terminal and navigate in the source code folder.

To init the environment and install all dependencies, enter

``` 
npm install
```

##
To start the program (with building etc.) enter

``` 
npm start
```

Once started, the service will listen on port `8080` and the sweeper will start checking for expired applications. By default, check is performed every 30 seconds and application expiry time is 60 seconds.

To change these values, you need to set some environment variables, that is:
 - `DISCOVERY_PORT` to set the listening port
 - `EXPIRY_TTL` to set the application TTL
 - `SWEEP_INTERVAL` to set the time frame in which the sweeper searches and removes expired applications
 
 For time-related environment variables, values should be set in milliseconds.
 To see the changes you have to restart the application. Rememeber that variables are unset once you close the terminal in which you have set them before. 
##
To run unit tests and generating the coverage, enter

``` 
npm test
```

Coverage is available at the generated `./coverage/lcov-report/index.html` (Open with a browser)

# API commands example

The web service runs on by default on `localhost:8080` if no port is set with `DISCOVERY_PORT` . If you have any other service bound on that port, please close it, otherwise the service won't run.

Examples here use [curl](https://curl.haxx.se/).

## Register and update an application

``` 
curl -v -X POST -H "Content-Type: application/json" http://localhost:8080/particle-detector/e335175a-eace-4a74-b99c-c6466b6afadd
```

Response:

``` js
{
    "id": "e335175a-eace-4a74-b99c-c6466b6afadd",
    "group": "particle-detector",
    "createdAt": 1595881522378,
    "updatedAt": 1595881522378
}
```

With metadata attached:

``` 
curl -v -X POST -H "Content-Type: application/json" http://localhost:8080/particle-detector/e335175a-eace-4a74-b99c-c6466b6afadd -d "{\"metadata\":{\"foo\":1}}"
```

Response:

``` js
{
    "id": "e335175a-eace-4a74-b99c-c6466b6afadd",
    "group": "particle-detector",
    "createdAt": 1595881753928,
    "updatedAt": 1595881522378, // updateAt is updated
    "metadata": {
        "foo": 1
    }
}
```

## Unregister an application

``` 
curl -v -X DELETE -H "Content-Type: application/json" http://localhost:8080/particle-detector/e335175a-eace-4a74-b99c-c6466b6afadd
```

Response:

``` js
{
    "message": "Application {\"id\":\"e335175a-eace-4a74-b99c-c6466b6afadd\",\"group\":\"particle-detector\"} successfully deleted"
}
```

## Registered applications summary

First, you need to register a bunch of applications ([here a bunch of commands to copy-paste](curl_misc.md)).

Then enter:

``` 
curl -v -H "Content-Type: application/json" http://localhost:8080/
```

Response:

``` js
[{
    "group": "particle-detector",
    "instances": 3,
    "createdAt": 1595882931774,
    "lastUpdatedAt": 1595883066658
}, {
    "group": "light-saber",
    "instances": 2,
    "createdAt": 1595883481638,
    "lastUpdatedAt": 1595883521883
}, {
    "group": "time-machine",
    "instances": 1,
    "createdAt": 1595883572868,
    "lastUpdatedAt": 1595883572868
}]
```

## List of group-related applications

``` 
curl -v -H "Content-Type: application/json" http://localhost:8080/particle-detector
```

Response:

``` js
[{
    "id": "e335175a-eace-4a74-b99c-c6466b6afadd",
    "group": "particle-detector",
    "createdAt": 1595882931774,
    "updatedAt": 1595882931774
}, {
    "id": "f0ef77e6-1cbf-42e1-9dc5-411eee04182f",
    "group": "particle-detector",
    "createdAt": 1595882953318,
    "updatedAt": 1595882967095
}, {
    "id": "ca68fb7c-a0f5-4da5-9602-40976962c072",
    "group": "particle-detector",
    "createdAt": 1595883066658,
    "updatedAt": 1595884174678,
    "metadata": {
        "foo": 1
    }
}]
```

# Remove expired applications

The `sweeper` component runs in background, searching and deleting expired applications.

Logic is based on `updatedAt` field, that is if an application has sent no heartbeat in a certain time frame (i.e. has not POSTed in a long time).

If `updatedAt` is equal or inferior to the difference between the current time in milliseconds and the set expiry time, application is removed from the db.

For instance, if the application sent its last known heartbeat on the 1st January 1970 at 12.00 and its expiry time is 1 minute, if the sweeper wakes up at 12.02, it will remove the application (sweeper is not always active, but it acts on a set interval constantly).

* 1 January 1970 12:00:00 => 43200000
* 1 minute => 60000
* 1 January 1970 12:02:00 => 43320000
* 43200000 < 43320000 - 60000

Application removed info will appear in the program logs, like:
```
Searching expired applications...
Removing expired application -> group: 'particle-detector' - id: 'ca68fb7c-a0f5-4da5-9602-40976962c072'
```

If you want to change time frames, remember to set `EXPIRY_TTL` and `SWEEP_INTERVAL` environment variables to change, respectively, applications' TTL and sweeper activation time. For further info, check the [installation](#installation) section.

# Notes

For more insight on this application, check its logs once run.
