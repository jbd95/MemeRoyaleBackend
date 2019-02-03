const mLab = require('mongolab-data-api')('w3f-NV1j2Csrdt0WOoC38yI2Rm2IgAj7')
const DATABASE_NAME = "memeroyale"

module.exports.createRoom = (roomCode, res)=>{ 

	let options = {
		database: DATABASE_NAME,
		collectionName: "Rooms",
		query: JSON.stringify({ code : roomCode.code})
	}

	mLab.listDocuments(options, function(err, data) {
		if (err) throw err;

		if (data.length === 0)
		{
			delete options['query']
			options['documents'] = roomCode
			mLab.insertDocuments(options, function(err, data)
			{
				if (err) throw err;
					res.json(newRoom)
			})
		}
		else
		{
			res.json({message: "fail - room already exists"})
		}
	})
}

module.exports = updateEntry = (dbName, colName, query, updates) => {
	
	let options = {
		database: dbName,
		collectionName: colName,
		data: updates,
		query: query,
	}

	mLab.updateDocuments(options, function(err, data)
	{
		if(err) throw err
		return
	})

}

module.exports.submitCaption = (dbName, colName, query, caption, socket) => {
	let options = {
		database: dbName,
		collectionName: colName,
		query: JSON.stringify(query)
	}

	mLab.listDocuments(options, function(err, data)
	{
		if(err) throw err
		if (data.length <= 0)
		{
			return
		}
	
		let replaced = false
		for (let i = 0; i < data[0].captions.length; i++)
		{
			if (data[0].captions[i].name === caption.name)
			{
				data[0].captions[i] = caption
				replaced = true
			}
		}

		if(!replaced)
		{
			data[0].captions.push(caption)
		}

		options['data'] = { captions : data[0].captions}

		mLab.updateDocuments(options, function(err, input)
		{
			if (err) throw err;
			console.log(input)
			socket.emit('debug', 'caption recieved')
		})
	})
}

