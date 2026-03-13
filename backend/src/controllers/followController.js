const Follower = require("../models/Follower");

exports.followUser = async(req,res)=>{

if(req.user.id === req.params.id){
return res.status(400).json({message:"Cannot follow yourself"});
}

const follow = await Follower.create({
followerId:req.user.id,
followingId:req.params.id
});

res.json(follow);

};

exports.unfollowUser = async(req,res)=>{

await Follower.deleteOne({
followerId:req.user.id,
followingId:req.params.id
});

res.json({message:"Unfollowed"});

};

exports.getFollowers = async(req,res)=>{

const followers = await Follower.find({
followingId:req.params.id
});

res.json(followers);

};

exports.getFollowing = async(req,res)=>{

const following = await Follower.find({
followerId:req.params.id
});

res.json(following);

};