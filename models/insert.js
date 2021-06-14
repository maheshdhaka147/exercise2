const mongoose=require("mongoose")
const fs=require("fs")

const schema=mongoose.Schema({
    vehicleTypes:[],
    makeName:String,
    makeId:String
})

const Make=mongoose.model('Make',schema)

const dbUrl='mongodb://mongo:27017/makes'

mongoose.connect(dbUrl, {useNewUrlParser: true,useUnifiedTopology: true})
.then(()=>{
    // Read Data from local file and insert into MongoDB Database
    fs.readFile("docs/make.txt","utf-8",(err,data)=>{
        if(!err){
            data=JSON.parse(data)
            console.log(typeof(data))
            Make.insertMany(data).then(()=>{
                console.log("Data inserted in mongodb database successfully.")
                console.log("Please visit http://localhost:8080")
            }).catch((err)=>{
                console.log(err)
            })
        }
    })
})



