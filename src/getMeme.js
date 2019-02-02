const express = require('express')
const router = express.Router()
const memegen = require('./memes')
const fetch = require('node-fetch')

router.get('/',(request, response)=>{
    let memeSchema = {
        template: memegen.memegen[request.query.template] || "Y U NO Guy",
        upperText: request.query.upperText || "IDC",
        bottomText: request.query.lowerText || "No Captions for U Boi",
    }

    let link = 'https://memegen.link/'+memeSchema.template+'/'+memeSchema.upperText+'/'+memeSchema.bottomText

    getMemegen = async(link)=>{
        const response = await fetch(link)
        const getResponse = await response.json()
        return getResponse.direct.masked
    }
    

    const res = getMemegen(link).then(someString => response.json({message: someString}))
    
})


module.exports = router