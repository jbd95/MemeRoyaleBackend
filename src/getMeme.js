const express = require('express')
const router = express.Router()
const memegen = require('./memes')
const requestAPI = require('request')
const fs = require('fs');

router.get('/',(request, response)=>{
    let memeSchema = {
        template: memegen.memegen[request.query.template] || "10 Guy",
        upperText: request.query.upperText || "MemeRoyale Sample",
        bottomText: request.query.lowerText || "MemeRoyale Sample",
    }

    let link = 'https://memegen.link/'+memeSchema.template+'/'+memeSchema.upperText+'/'+memeSchema.bottomText

    let responseJson = ''
    console.log(link)
    requestAPI(link,(error,request,body)=>{
        responseJson = JSON.parse(body)
        response.json({link:responseJson.direct.masked})
    })
  //  const res = getMemegen(link).then(someString => response.json({message: someString}))
    
})

    router.get('/getCarousel',(request, response)=>{
        let set = Object.keys(memegen.memegen)
        let setArray = []
        let low = 10, high = 80
        for(let i = 0; i < 6; i++){
            let random = Math.floor(Math.random()* (+high - +low))+ +low;
            setArray.push({endpoint:set[random]})
            
        }
        console.log(setArray)
        response.json({collection:setArray})
    })

module.exports = router