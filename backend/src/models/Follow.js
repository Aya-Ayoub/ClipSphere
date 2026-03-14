const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({

  followerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  followingId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  }

});

/* Prevent duplicate follows */
followSchema.index(
  { followerId:1, followingId:1 },
  { unique:true }
);

/* Prevent self-follow */

followSchema.pre("save", function(){

  if(this.followerId.toString() === this.followingId.toString()){
    throw new Error("Cannot follow yourself");
  }

});

module.exports = mongoose.model("Follow",followSchema);