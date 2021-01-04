const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require("../keys")
const requireLogin = require("../middleware/requireLogin")
const nodemailer = require('nodemailer')
const sendgridTransport = require("nodemailer-sendgrid-transport")

const crypto = require("crypto")

const transport = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:"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"

    }
}))





router.post("/signup" ,(req,res) => {
    const {email,name,password,pic} = req.body;
    if(!email || !password || !name){
        return res.status(400).json({error:"Please add all the field"})
    }
    else{
        
    
    User.findOne({email:email})
    .then((savedUser) => {
        if(savedUser){
            return res.status(422).json({error:"User already exists with that email"})
        }
        

        bcrypt.hash(password,10)
        .then(hashedPassword => {

            const user = new User({
                name ,email,password:hashedPassword,pic
            })
            user.save()
            .then(user => {
                transport.sendMail({
                    to:user.email,
                    from:"abhilakshbansal2001@gmail.com",
                    subject:"Welcome " + name,
                    html:"<h1>We are glad to have you here</h1>"
                }).then(response => {
                    console.log(response);
                })
                .catch(err => console.log(err))
                res.json({message:"Saved Successfully"})
            })
            .catch(error => {
                console.log(error);
            })

        })


    })
    .catch(err => {
        console.log(err);
    })
}
})


router.post('/signin',(req,res) => {
    const {email,password} = req.body
    if(!email || !password){
        return res.status(400).json({
            error:"Please add email and password"
        })

    }
    User.findOne({email:email})
    .then(savedUser => {
        if(!savedUser){
            return res.status(422).json({
                error:"Invalid Email or Password"
            })
        }

        bcrypt.compare(password,savedUser.password)
        .then(isMatch => {
            if(isMatch){
                
                //jwt token
                const token = jwt.sign({_id: savedUser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic} = savedUser
                res.json({token,user:{name,email,_id,pic,followers,following}})


                // res.json({
                //     message:"successfully signed in"
                // })
            }
            else {
                return res.status(422).json({
                    error:"Invalid Email or Password"
                })
            }
        })
        .catch(err => {
            res.status(500).json({error:"Something went wrong"})
            console.log(err);
        })

    })
})

router.post("/reset-password",(req,res) => {
    crypto.randomBytes(32,(err,buffer) => {
        if(err)
            console.log(err);
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user => {
            if(!user)
                return res.json({error:"User don't exists"})
            user.resetToken = token;
            user.expireToken = Date.now() + 3600*1000
            user.save()
            .then((result) => {
                transport.sendMail({
                    to:user.email,
                    from:"abhilakshbansal2001@gmail.com",
                    subject:"Password reset",
                    html:`
                        <p>You requested for password reset</p>
                        <h5>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password:</h5>

                    `

                })
                res.json({message:"check your email"})
            })
        })
    })
})

router.post("/new-password",(req,res) => {
    const newPassword = req.body.password;
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user => {
        if(!user)
            return res.status(422).json({error:"try again later"})
        bcrypt.hash(newPassword,8)
        .then(hashedPassword => {
            user.password = hashedPassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save()
            .then(savedUser => {
                res.json({message:"Password updated success"})
            })
        })
    }).catch(err => {
        console.log(err);
    })
})

module.exports = router