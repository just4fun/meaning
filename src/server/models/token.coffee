mongoose = require('mongoose')

TokenSchema = new mongoose.Schema
  Username: String
  Token: String
  LoginDate: Date

mongoose.model "Token", TokenSchema