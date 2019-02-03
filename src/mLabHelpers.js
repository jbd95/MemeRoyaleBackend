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
					res.json(roomCode)
			})
		}
		else
		{
			res.json({message: "fail - room already exists"})
		}
	})
}

module.exports.getEntry = (dbName, colName, query, res) => {
	let options = {
		database: dbName,
		collectionName: colName,
		query: JSON.stringify(query)
	}

	mLab.listDocuments(options, function(err, data)
	{
		if (err) throw err
		res.json(data)
	})

}

module.exports.updateEntry = (dbName, colName, query, updates) => {
	
	let options = {
		database: dbName,
		collectionName: colName,
		data: updates,
		query: JSON.stringify(query)
	}

	mLab.updateDocuments(options, function(err, data)
	{
		if(err) throw err
		return
	})

}


module.exports.submitVote = (dbName, colName, query, caption, res) => {

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
	
		let i = 0
		for (; i < data[0].captions.length; i++)
		{
			if (data[0].captions[i].name === caption.name)
			{
				data[0].captions[i]['votes'] += 1
				break
			}
		}

		
		
		options['data'] = { captions : data[0].captions[i], isVotingEnded: 1 }

		let uoptions = {
			database : dbName,
			collectionName : 'Users',
			query : JSON.stringify({ name : caption.name})
		}

		console.log(uoptions)

		mLab.listDocuments(uoptions, function(err, idata)
		{
			if(err) throw err


			if(idata.length <= 0)
			{
				return
			}

			idata[0]['score'] += 1
			uoptions['data'] = idata[0]
		

			mLab.updateDocuments(uoptions, function(err, input)
			{
				if (err) throw err
				return
			})
		})

	
		mLab.updateDocuments(options, function(err, input)
		{
			if (err) throw err
			console.log(input)

		})
	})
}


module.exports.getWinner = (dbName, colName, query, res) => {

	let options = {
		database: dbName,
		collectionName: colName,
		query: JSON.stringify(query)
	}



	mLab.listDocuments(options, function(err, data)
	{
		if (data.length > 0 && data[0].captions.length > 0)
		{
			let maxScore = data[0].captions[0]
			for(let i = 1; i < data[0].captions.length; i++)
			{
				if(data[0].captions[i]['votes'] > maxScore['votes'])
				{
					maxScore = data[0].captions[i]
				}
			}

			res.json(maxScore)
		}
		else
		{
			res.json( { message : "error - no players found" })
		}
	})
}

module.exports.submitCaption = (dbName, colName, query, caption, socket) => {
	let options = {
		database: dbName,
		collectionName: colName,
		query: JSON.stringify(query)
	}


	let uoptions = {
		database: dbName,
		collectionName: 'Users',
		query: JSON.stringify({ room : query.code})
	}


	let users = null

	mLab.listDocuments(uoptions, function(err, data)
	{
		if (err) throw err
	
		users = data.length
	})


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


		console.log(data[0])
		console.log(data[0].captions.length)
		console.log(users - 1)
		
		if(data[0].captions.length >= (users - 1))
		{
			options['data'] = { captions : data[0].captions, isSubmissionEnded : 1 }
		}
		else
		{
			options['data'] = { captions : data[0].captions }
		}

		console.log(options['data'])
	
		mLab.updateDocuments(options, function(err, input)
		{
			if (err) throw err;
			console.log(input)
			socket.emit('debug', 'caption recieved')
		})
	})
}



