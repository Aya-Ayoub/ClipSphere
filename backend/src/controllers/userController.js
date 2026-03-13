const User = require("../models/User");

exports.getMe = async(req,res)=>{

res.json(req.user);

};

exports.updateMe = async(req,res)=>{

const user = await User.findByIdAndUpdate(
req.user.id,
req.body,
{ new:true }
);

res.json(user);

};

exports.getUser = async(req,res)=>{

const user = await User.findById(req.params.id);

res.json(user);

};