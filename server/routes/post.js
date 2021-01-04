const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const Post = require("../models/post")
const requireLogin = require("../middleware/requireLogin")



router.get('/allpost' ,requireLogin,(req,res) => {
    Post.find()
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts => {
        res.json({posts})
    })
    .catch(error => {
        console.log(error);
    })
})

router.post('/createpost' ,requireLogin, (req,res) => {
    const {title ,body , url} = req.body
    if(!title || !body){
        return res.status(400).json({error:"Please add all the fields"})
    }

    req.User.password = undefined

    const post = new Post({
        title,
        body,
        url,
        postedBy:req.User
    })

    post.save().then(result => {
        if(result){
            res.status(201).json({post:result})
        }
    }).catch(error => {
        console.log(error);
    })

})

router.get("/mypost",requireLogin,(req,res) => {
    Post.find({postedBy:req.User._id})
    .populate("postedBy","_id name")
    .then(posts => {
        if(posts)
        res.json({posts})

        else{
            return res.json({message:"nothing found"})
        }
    })
    .catch(error => {
        console.log(error);
    })

})

//Like route
router.put("/like",requireLogin,(req,res) => {
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.User._id}
    },{
        new:true
    })
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .exec((err,result) => {
        if(err){
            return res.status(402).json({error:err})
        }
        else{
            res.json(result)
        }
    })

})
// unlike
router.put("/unlike",requireLogin,(req,res) => {
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.User._id}
    },{
        new:true
    })
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .exec((err,result) => {
        if(err){
            return res.status(402).json({error:err})
        }
        else{
            res.json(result)
        }
    })

})

//comment route


router.put("/comment",requireLogin,(req,res) => {

    const comment = {
        text: req.body.text,
        postedBy:req.User._id
    }

    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .exec((err,result) => {
        if(err){
            return res.status(402).json({error:err})
        }
        else{
            res.json(result)
        }
    })

})

// deleting post 
router.delete("/deletepost/:postid" ,requireLogin, (req , res) => {
    Post.findOne({_id:req.params.postid})
    .populate("postedBy","_id")
    .exec((err,post) => {
        if(err || !post){
            return res.status(422).json({error : err})
        }
        if(post.postedBy._id.toString() === req.User._id.toString()  ){
            post.deleteOne()
            .then(result => {
                res.json(result)
            }).catch(err => console.log(err))
        }
    })
})


// get following post


router.get('/getsubpost' ,requireLogin,(req,res) => {
    Post.find({postedBy:{$in:req.User.following}})
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')

    .then(posts => {
        res.json({posts})
    })
    .catch(error => {
        console.log(error);
    })
})



module.exports = router