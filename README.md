# Content Platform App
A Node app built with NestJS and PostgreSQL.

Node provides the RESTful API. PostgreSQL stores like a hoarder.

## Description

This is a content platform where anyone can register as a blogger and publish posts on various topics. 
Another users can read these posts, put likes/dislikes (if they haven't been banned by blogger or super admin).
Users also have the opportunity to participate in a Quiz game, get points for it and get into the top players.

## Requirement
NodeJS
PostgreSQL

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit test
$ yarn run test

# e2e test
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```