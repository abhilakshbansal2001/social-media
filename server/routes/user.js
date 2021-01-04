const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const Post = require("../models/post")
const User = require("../models/user")
const requireLogin = require("../middleware/requireLogin")


//auth
router.get("/authenticated",requireLogin,(req,res) => {
    if(req.User){
        res.json({isAuthenticated : true,user:req.User})
    }
})



router.get('/user/:id',requireLogin,(req,res) => {
    User.findOne({_id:req.params.id})
    .then(user => {
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id name")
        .select("-password")
        .exec((err,posts) => {
            if(err){
                return res.status(422).json({error:err})
            }
            user.password = undefined
            res.json({user,posts})
        })

    }).catch(err => {
        return res.status(404).json({error:"User Not Found"})
    })
})


router.put('/follow',requireLogin,(req,res) => {
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.User._id}
    },{
        new:true
    },(err , result) => {
        if(err){
            return res.status(422).json({error:err})
        }
        // return res.json(result)
        User.findByIdAndUpdate(req.User._id,{
            $push:{following:req.body.followId}

        },{
            new:true
        }).select("-password").then(data => {
            // if(e)
            //     return res.status(422).json({error:e})
            return res.status(200).json(data)

           
        })

    })
  
})

router.put('/unfollow',requireLogin,(req,res) => {
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.User._id}
    },{
        new:true
    },(err , result) => {
        if(err){
            return res.status(422).json({error:err})
        }
        // return res.json(result)
        User.findByIdAndUpdate(req.User._id,{
            $pull:{following:req.body.unfollowId}

        },{
            new:true
        }).select("-password").then(data => {
            // if(e)
            //     return res.status(422).json({error:e})
            return res.status(200).json(data)

           
        })

    })

})

//Update Pic

router.put('/updatePic',requireLogin,(req,res) => {
    User.find({_id:req.User._id},(err,docs) => {
        User.update({_id:req.User._id},{
            pic:req.body.pic
        },(err,affected) => {
            if(err)
                return res.status(422).json("Something went wrong")
            else{
                docs[0].pic = req.body.pic
                docs[0].password = undefined
                res.json(docs)
            }
        })
    })
})


module.exports = router