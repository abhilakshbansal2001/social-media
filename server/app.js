const express  = require("express")
const app = express()
const mongoose = require("mongoose")
const PORT = process.env.PORT || 5000;
const User = require("./models/user") 
const Post = require("./models/post") 
// //CORS
// const cors = require("cors")
//url
const {MONGOURI} = require("./keys")
//json parser
app.use(express.json())
// app.use(cors)
app.use(require("./routes/auth"))
app.use(require("./routes/post"))
app.use(require("./routes/user"))

mongoose.connect(MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
mongoose.connection.on("connected",() => {
    console.log("connected");
})
mongoose.connection.on("error",(err) => {
    console.log("Error",err);
})



app.listen(PORT , () => {
    console.log("Server Running " + PORT );
})

// Hz6VwZyzWd9BfWpf