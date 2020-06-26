//to store config info for our server
module.exports = {
  //secret key for signing my json web token
  secretKey: "12345-67890-09876-54321",
  mongoUrl: "mongodb://localhost:27017/conFusion",
  facebook: {
    clientId: "666218904235092",
    clientSecret: "3a564cbdf53303c2fdd131974c7b73ac"
  }
};

//1) when the client sends a access token to the express server, express server sends it along with app id and secret to the facebook OAuth server to fetch profile information
//2) next the express server used the facebook id to create a new account for the user
