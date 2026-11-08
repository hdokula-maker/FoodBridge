
# FoodBridge – Food Waste Redistribution Platform

## 1. Project Overview

FoodBridge is a full-stack web application designed to reduce food wastage by connecting restaurants, NGOs, and volunteers. It provides a centralized platform where restaurants can donate surplus food, NGOs and volunteers can claim available donations, and administrators can manage platform activities.

The main goal of FoodBridge is to ensure that surplus food reaches people in need instead of being wasted.

## 2. Problem Statement

A large amount of food is wasted by restaurants and food establishments, while many people struggle to access sufficient food. FoodBridge addresses this problem by providing a digital platform that makes food donation, claiming, and distribution easier and more organized.

## 3. Technologies Used

### Frontend
- HTML
- CSS
- JavaScript
- React.js
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Deployment
- Vercel – Frontend hosting
- Render – Backend hosting

### Development Tools
- Visual Studio Code
- Git and GitHub
- Postman / Browser for API testing

## 4. Main Modules

### Restaurant Module
- Register and log in as a restaurant.
- Add surplus food donations.
- View available food donations.
- Edit and delete donation listings.

### NGO Module
- Register and log in as an NGO.
- Browse available food donations.
- Search and filter donations.
- Claim food donations.
- View claimed donations and their status.

### Volunteer Module
- Register and log in as a volunteer.
- Browse available food donations.
- Search and filter food listings.
- Claim food donations.
- Track claimed donations.

### Admin Module
- View platform statistics.
- Manage registered users.
- View food donation records.
- Delete food donation listings.
- Refresh dashboard information.

## 5. Key Features

- Role-based user access.
- Secure registration and login using password hashing and JWT authentication.
- Food donation management with CRUD operations.
- RESTful API integration.
- Food search and category filtering.
- Food claiming functionality.
- Admin dashboard for platform management.
- Responsive user interface.

## 6. Project Folder Structure

```text
FoodBridge/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 7. Installation and Setup

### Prerequisites
- Node.js
- npm
- MongoDB Atlas account
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/hdokula-maker/FoodBridge.git
cd FoodBridge
```

### Step 2: Install Frontend Dependencies

```bash
cd client
npm install
```

### Step 3: Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file inside the server folder and configure:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Use your own MongoDB connection string and a secure JWT secret. Do not upload the `.env` file to GitHub.

### Step 5: Run the Backend

Inside the server folder:

```bash
npm run dev
```

### Step 6: Run the Frontend

Inside the client folder:

```bash
npm run dev
```

Open the local frontend URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## 8. Live Deployment

**Frontend:** https://food-bridge-nu-nine.vercel.app/

**Backend:** https://foodbridge-z62e.onrender.com/

## 9. GitHub Repository

https://github.com/hdokula-maker/FoodBridge

## 10. Future Enhancements

- Email and SMS notifications.
- Google Maps integration for food pickup locations.
- Food expiry alerts.
- Advanced analytics and reports.
- Mobile application support.

## 11. Conclusion

FoodBridge provides a digital solution for reducing food wastage by connecting restaurants, NGOs, and volunteers. Through its role-based dashboards, donation management, and food claiming features, the platform helps make food redistribution more efficient and accessible.

The project demonstrates the implementation of a full-stack web application using React.js, Node.js, Express.js, and MongoDB.
