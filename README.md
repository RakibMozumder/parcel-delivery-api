# Parcel Delivery API

A RESTful API for managing parcel deliveries, developed by **Rakib Mozumder** using **TypeScript**, **Express.js**, **MongoDB**, and **JWT** authentication. This API allows users to send and receive parcels, track delivery status, and supports role-based access control for Senders, Receivers, and Admins.


##  Features

This API supports a wide range of functionalities for different user roles:

-   **User Management**: Senders, receivers, and admins can be managed with secure authentication.
-   **Parcel Creation**: Senders can create new parcel delivery requests, with automatic fee calculation based on weight.
-   **Parcel Tracking**: Each parcel is assigned a unique tracking ID and includes a detailed status log history.
-   **Role-Based Access Control**: Different user roles have specific permissions:
    -   **Sender**: Can create and cancel their own parcels, and view their parcel history.
    -   **Receiver**: Can view their inacoming parcels and confirm delivery.
    -   **Admin**: Can manage all users and parcels, update statuses, and block users or parcels.
-   **Data Integrity**: Parcel creation requires the sender and receiver to have a phone number and address in their profile.
-   **Dynamic Filtering**: Users can filter their parcel history by status and date.

## Technologies

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Authentication**: JWT (JSON Web Tokens)
-   **Validation**: Zod
-   **Linting**: ESLint, Prettier

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd parcel-delivery-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```
    PORT=5000
    DB_URL=<your-mongodb-connection-string>
    JWT_ACCESS_SECRET=<your-jwt-secret>
    BCRYPT_SALT_ROUND=10
    EXPRESS_SESSION_SECRET=<your-session-secret>
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:5000`.

## 📂 API Endpoints

### User Endpoints

| Method | Endpoint                    | Description                                  | Access       |
| :----- | :-------------------------- | :------------------------------------------- | :----------- |
| `POST` | `/api/v1/user/create-user`  | Create a new user account.                   | Public       |
| `PATCH`| `/api/v1/user/update-user/:id` | Update a user's profile.                     | Admin, Self  |
| `GET`  | `/api/v1/user/get-all-users`| Get a list of all users.                     | Admin        |

### Parcel Endpoints

| Method | Endpoint                               | Description                                      | Access        |
| :----- | :------------------------------------- | :----------------------------------------------- | :------------ |
| `POST` | `/api/v1/parcel/create-parcel`         | Create a new parcel delivery request.            | Sender        |
| `GET`  | `/api/v1/parcel/my-parcels`            | View all parcels associated with the user.       | Sender, Receiver |
| `GET`  | `/api/v1/parcel/get-parcel/:id`        | Get details of a single parcel.                  | Sender, Receiver, Admin |
| `PATCH`| `/api/v1/parcel/cancel-parcel/:id`     | Cancel a parcel (if not dispatched).             | Sender        |
| `PATCH`| `/api/v1/parcel/confirm-delivery/:id`  | Confirm delivery of a parcel.                    | Receiver      |
| `PATCH`| `/api/v1/parcel/update-status/:id`     | Update a parcel's status.                        | Admin         |
| `PATCH`| `/api/v1/parcel/block-parcel/:id`      | Block a parcel.                                  | Admin         |

---

## 👨‍💻 Developed By

**Rakib Mozumder**  
