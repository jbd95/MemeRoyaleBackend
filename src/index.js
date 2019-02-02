const app = require('express')()
const http = require('http').Server(app)
const PORT = process.env.PORT || 5001

app.get('/', function(req, res){
  res.json({message:"success"})
})

http.listen(PORT, function(){
  console.log('listening on *:',PORT)
})