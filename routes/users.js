var mongoose=require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb+srv://bashumoulik:9rqyjpljc@cluster0.vx0fnef.mongodb.net/?retryWrites=true&w=majority');

const userModel = new mongoose.Schema({
  username:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  dp:{
    type:String
  },
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }],
  fullname:{
    type:String,
    required:true
  },
  tagline:{
    type:String
  },
  description:{
    type:String
  }
});

userModel.plugin(plm);

module.exports = mongoose.model('User',userModel);