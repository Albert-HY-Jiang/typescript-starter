<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

NestJS Feature Enhancement Assignment for RA lab. A REST API to manage users and events.

## Project setup
This is project is using mysql for database management. Set up mysql and update login info in ./src/app.module.ts and ./test/app.e2e-spec.ts
```bash
$ npm install
$ npm install @nestjs/typeorm typeorm mysql2 --save
$ npm install @nestjs/testing --save
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

```
