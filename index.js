const express = require("express");
const mongoose=require("mongoose")

const app=express()
const port=process.env.PORT || 8080

const schema=mongoose.Schema({
    makeId:String,
    makeName:String,
    vehicleTypes:[]
})
const Make=mongoose.model('Make',schema)
const dbUrl='mongodb://mongo:27017/makes'

app.get("/",(req,res)=>{
    // Fetch Data From MongoDB Server and Serve it
    mongoose.connect(dbUrl, {useNewUrlParser: true,useUnifiedTopology: true})
    .then(()=>{
        console.log("Connected Successfully")
        async function getMakes(){
            const makes=await Make.find().select({makeId:1,makeName:1,vehicleTypes:1})
            return makes
        }
        getMakes().then(makes=>{
            const orderedMakes=[]
            Object.keys(makes).map(index=>{
                const obj={
                    "makeId":makes[index].makeId,
                    "makeName":makes[index].makeName,
                    "vehicleTypes":makes[index].vehicleTypes
                }
                orderedMakes.push(obj)
            })
            res.send(orderedMakes)
        })
    }) 
})


app.get("*",(req,res)=>{
    res.status(404).send(`Page Not Found`)
})


app.listen(port,()=>{
    console.log(`Server is listening at port ${port}`)
})


