const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("../keys")
const mongoose = require('mongoose')
const User = require("../models/user")
const { json } = require("express")

module.exports = (req,res,next) => {
    const {authorization} = req.headers

    if(!authorization){
      return  res.status(401).json({error:"you must be logged in"})

    }
    const token = authorization.replace("Bearer " ,"")
    jwt.verify(token,JWT_SECRET,(err,payload) => {
        if(err)
            return res.status(401).json({error:"you must be logged in"})
        const {_id} = payload
        User.findById(_id)
        .then((userData) => {
            if(userData){
                
            req.User = userData
            next();
        }
        })
        .catch(err => {
            return res.status(401).json({error:"oops! something went wrong"})

        })

        
    })
}