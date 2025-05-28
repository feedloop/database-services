# database-services

# Database Services - Backend as a Service (BaaS)

This project provides a dynamic backend system offering Database as a Service capabilities using Node.js, TypeScript, Express, and PostgreSQL. It supports flexible DDL & DML operations through a REST API.
GitHub Repository: [https://github.com/feedloop/database-services](https://github.com/feedloop/database-services)

## Features

* Dynamic DDL operations to create, alter, or drop tables and columns via API.
* Dynamic DML operations for inserting, selecting, updating, and deleting data.
* Authentication with JWT and support for API keys.
* Interactive Swagger documentation.
* Runs entirely in Docker using Docker Compose – no manual setup required.

## Environment Setup

All required environment variables are already configured in `docker-compose.yml`. However, if you prefer using a `.env` file, make sure it includes:

```env
PORT=3000
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1h
NODE_ENV=development
DB_USERNAME=postgres
DB_PASSWORD=12345678
DB_NAME=database_services
DB_HOST=db
DB_PORT=5432
```

## Running with Docker Compose

To start both the backend and PostgreSQL database:

```bash
docker-compose up --build
```

The backend will be available at:

```
http://localhost:3000
```

Swagger API docs:

```
http://localhost:3000/api-docs
```

## Sequelize Sync & Database Initialization

This project uses `sequelize.sync({ alter: true })`, which will:

* Automatically create or update tables to match model definitions.
* Ensure your database structure is always in sync on startup.

### Running Without Docker

If you prefer to run the backend without Docker:

1. Make sure PostgreSQL is running locally on your machine.
2. Create a database named `database_services` with user `postgres` and password `12345678`, or update your `.env` accordingly.
3. Install dependencies:

```bash
yarn install
```

4. Build the project:

```bash
yarn build
```

5. Start the server:

```bash
yarn start
```

During development, you can use:

```bash
yarn dev
```

> Sequelize will automatically sync the database on startup.

### Deployment

This project has been deployed and is publicly accessible via:

```
http://203.194.113.104:3000
```

You can test if the service is running using:

```
http://203.194.113.104:3000/health
```

And explore the API documentation at:

```
http://203.194.113.104:3000/api-docs
```

> Note: Domain configuration and HTTPS setup are in progress.

## Main API Endpoints

All endpoints are prefixed with `/api`.

* `POST /auth/login` – Authenticate and receive a JWT.
* `POST /apikey/generate` – Generate an API key (requires JWT).
* `POST /migrate` – Perform DDL operations like creating, altering, or dropping tables and columns.
* `GET /schemas` – Retrieve metadata of available tables and columns.
* `POST /execute` – Execute dynamic DML operations such as insert, select, update, or delete.
* `POST /query` – Run custom SQL-like queries on existing dynamic tables.
* `GET /users` – Development-only endpoint to retrieve all users (requires JWT).

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api-docs
```
Or in production:

```
http://203.194.113.104:3000/api-docs
```

## Health Check

To verify the server is running:

```bash
curl http://localhost:3000/health
```
Or in production:

```bash
curl http://203.194.113.104:3000/health
```

## Running Tests (Optional)

If test files are present, you can run:

```bash
yarn test
```

(If using Docker: exec into the container and run inside)

## Author

This project is developed by Rifa Sania as part of the MBKM Mandiri internship at PT Feedloop Global Teknologi.
