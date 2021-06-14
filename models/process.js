const mongoose=require("mongoose")
const fetch=require("node-fetch")
const convert = require('xml-js')
const fs=require("fs")


// Fetch Data For All the makes
async function getData(url){
        const response=await fetch(url)
        const str= await response.text()
        return str
}

async function getDataByMake(url,makeId,makeName){
    const response=await fetch(url)
    const str= await response.text()
    return [str,makeId,makeName]
}

getData("https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML").then((str)=>{
    // Convert XML to JSON
    let dataAsJson = JSON.parse(convert.xml2json(str, {compact: true}))
    let AllVehicleMakes=dataAsJson.Response.Results.AllVehicleMakes
    let keys=Object.keys(AllVehicleMakes)  
    console.log(`Fetch data for ${keys.length} make id's`)
    let output=[]
    keys.forEach((objKey)=> {
        let objValue = AllVehicleMakes[objKey]
        let makeId=objValue.Make_ID._text
        let makeName=objValue.Make_Name._text
        let idObj={
            "makeId":makeId,
            "makeName": makeName,
            "vehicleTypes":[]
        }
        output.push(idObj)
    })

    // Let's Begin Fetch by MakeID
    let outputLength=Object.keys(output).length
    let j=0
    let outputWithMake=[]
    // The function will send a new request each 500ms ultil all data fetched
    const interval=setInterval(()=>{
        url=`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${parseInt(output[j].makeId)}?format=xml`
        console.log(`Fetching ${url} for j=${j}`)
        getDataByMake(url,output[j].makeId,output[j].makeName).then(([str,makeId,makeName])=>{
            // Catch error, if occures
            try{
                // Convert XMl to JSON
                let dataAsJson = JSON.parse(convert.xml2json(str, {compact: true}))
                let perIdMakes=dataAsJson.Response.Results.VehicleTypesForMakeIds
                let length=parseInt(dataAsJson.Response.Count._text)
                let idObj={
                    "makeId":makeId,
                    "makeName": makeName,
                    "vehicleTypes":[]
                }
                let vehicleTypesArr=[]
                if(length===1){// if make id have only one type of vehicleTypes
                    let vehicleTypeId=perIdMakes.VehicleTypeId. _text
                    let vehicleTypeName=perIdMakes.VehicleTypeName. _text
                    let obj={
                        "typeId": vehicleTypeId,
                        "typeName": vehicleTypeName,
                    }
                    vehicleTypesArr.push(obj)
                }else{// if make id have multiple types of vehicleTypes
                    for(let i=0;i<length;i++){
                        let objValue = perIdMakes[i]
                        let vehicleTypeId=objValue.VehicleTypeId. _text
                        let vehicleTypeName=objValue.VehicleTypeName. _text
                        let obj={
                            "typeId": vehicleTypeId,
                            "typeName": vehicleTypeName,
                        }
                        vehicleTypesArr.push(obj)
                    }
                }
                idObj.vehicleTypes=vehicleTypesArr   
                outputWithMake.push(idObj)
                if(j+1===outputLength){
                    clearInterval(interval)
                    // If all data fetched, store it to a local file. Later it would be transferred to MongoDB server
                    fs.writeFile("docs/make.txt",JSON.stringify(outputWithMake),(err)=>{
                        if(err) console.log(err)
                    })
                }
            }catch(error){
                console.log(error)
            }
        })

        j=j+1

    },500)
})



    




