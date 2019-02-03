const express = require('express')
const router = express.Router()
const memegen = require('./memes')
const requestAPI = require('request')

router.get('/',(request, response)=>{
    let memeSchema = {
        template: memegen.memegen[request.query.template] || "10 Guy",
        upperText: request.query.upperText || "IDC",
        bottomText: request.query.lowerText || "No Captions for U Boi",
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


module.exports = router