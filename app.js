require("dotenv").config();
require("./config/database").connect();
const bcrypt = require("bcryptjs/dist/bcrypt");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());

const User = require("./model/user")

// Register 
app.post("/register",async (req,res)=>{
  // regsiter code here

  try {
    const { first_name,last_name,email,password} = req.body;
    if( !(email && password && first_name && last_name )){
      res.status(400).send("All input are required");
    }

    const oldUser =  await User.findOne({email});

    if(oldUser){
      return res.status(409).send("User already exists,please login")
    }
    encryptedPassword = await bcrypt.hash(password,10);

    const user = await User.create({
      first_name,
      last_name,
      email:email.toLowerCase(),
      password:encryptedPassword
    });

    const token = jwt.sign(
      {user_id:user._id,email},
      process.env.TOKEN_KEY,
      {
        expiresIn:"2h"
      }
    );
    user.token = token;
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }

});

app.post("/login",async (req,res)=>{
  try {
    const {email,password} = req.body;
    if(!(email && password)){
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({email});

    if( user && await bcrypt.compare(password,user.password)){
      const token = jwt.sign(
        {user_id:user._id,email},
        process.env.TOKEN_KEY,
        {
          expiresIn:"2h"
        }
      );
      user.token = token;

      res.status(200).json(user);
    }
    res.status(400).send("Invalid credentails");
  } catch (error) {
    
  }
});

const auth = require("./middleware/auth");

app.post("/welcome",auth,(req,res) => {
  res.status(200).send("Welcome 🙌 ")
});

module.exports = app;