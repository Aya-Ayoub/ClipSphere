const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
{
  username: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["user","admin"],
    default: "user"
  },

  bio: String,

  avatarKey: String,

  active: {
    type: Boolean,
    default: true
  },

  preferences:{

    inApp:{
      followers:{type:Boolean,default:true},
      comments:{type:Boolean,default:true},
      likes:{type:Boolean,default:true},
      tips:{type:Boolean,default:true}
    },

    email:{
      followers:{type:Boolean,default:true},
      comments:{type:Boolean,default:true},
      likes:{type:Boolean,default:true},
      tips:{type:Boolean,default:true}
    }

  },

  accountStatus:{
    type:String,
    default:"active"
  }

},
{ timestamps:true }
);

userSchema.pre("save", async function(next){

  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password,10);


});

module.exports = mongoose.model("User",userSchema);