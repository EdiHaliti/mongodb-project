# Car Rental API By Edi Haliti

This project is a simple REST API built with Node.js, Express, and MongoDB. It demonstrates user registration, login, viewing a user profile, and searching for rental cars. Authentication is implemented using JSON Web Tokens (JWT).
 Installation

1. Clone the Repository:

   git clone https://github.com/EdiHaliti/mongodb-project.git
   cd mongodb-project
npm install
2.	Create the .env File:
In the project root, create a file .env with the following content:
PORT=3002
MONGO_URI=mongodb://localhost:27017/carRental
JWT_SECRET=your_jwt_secret
The server should now be running on http://localhost:3002.
API Endpoints
1. Welcome Route
•	URL: http://localhost:3002/
•	Method: GET
•	Description: Returns a welcome message indicating that the API is running.
2. Register
•	URL: http://localhost:3002/register
•	Method: POST
•	Description: Registers a new user with the following attributes: full name, email, username, and password.
•	Body (Select json):
{
  "fullName": "Edi Haliti",
  "email": "edi.haliti31@gmail.com",
  "username": "edihaliti",
  "password": "edi123"
}
3. Login
•	URL: http://localhost:3002/login
•	Method: POST
•	Description: Authenticates a user and returns a JWT token.
•	Request Body Example (Select Json):
{
  "username": "edihaliti",
  "password": "edi123"
}
4. My Profile
•	URL: http://localhost:3002/my-profile
•	Method: GET
•	Description: Returns the profile information (full name, email, and username) for the currently authenticated user.
•	Headers: Include a valid JWT token in the Authorization header:
Authorization: Bearer <your_jwt_token>
5.Add Car
•	URL:http://localhost:3002/cars
•	Method: POST
•	Body Select (json): 
{
  "name": "Golf mk8",
  "price_per_day": 50.0,
  "year": 2015,
  "color": "black",
  "steering_type": "automatic",
  "number_of_seats": 5
}

6. Rental Cars
•	URL: http://localhost:3002/rental-cars
•	Method: GET
•	Description: Returns a list of available rental cars sorted by price from lowest to highest. You can also filter cars by:
o	year
o	color
o	steering_type
o	number_of_seats
•	Example URL with Query Parameters:
http://localhost:3002/rental-cars?year=2015&color=black
