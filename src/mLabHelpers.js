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

	let userOptions = {
		database: dbName,
		collectionName: 'Users',
		query: JSON.stringify( { room : query.code})
	}

	let userCount = null
	mLab.listDocuments(userOptions, function(err, data)
	{
		userCount = data.length
		let totalVotes = 0

		for(let i = 0; i < data.length; i++)
		{
			if (data[i].name === caption.name)
			{
				data[i].score += 1


				userOptions['data'] = { score : data[i].score }

				mLab.updateDocuments(userOptions, function(err2, data2)
				{
					return
				})
			}
			totalVotes += data[i].score
		}

		console.log("total votes: " + totalVotes)
		console.log("user count: " + userCount)
		if(totalVotes >= userCount)
		{
			let options = {
				database: dbName,
				collectionName: "Rooms",
				query : JSON.stringify({ code : query.code}),
				data: { isVotingEnded: 1 }
			}

			mLab.updateDocuments(options, function(err3, data3)
			{
				console.log(data3)
				return
			})
		}

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


	let userOptions = {
		database: dbName,
		collectionName: 'Users',
		query: JSON.stringify( { room : query.code})
	}
	let userCount = null
	mLab.listDocuments(userOptions, function(err, data)
	{
		userCount = data.length
	})


	let allCaptions = null;
	mLab.listDocuments(options, function(err, data)
	{
		if(data.length > 0)
		{
			allCaptions = data[0].captions
		}
		allCaptions.push(caption)

		if (allCaptions.length >= userCount)
		{
			options['data'] = { captions: allCaptions, isSubmissionEnded: 1}
		}
		else
		{
			options['data'] = { captions: allCaptions }
		}


		mLab.updateDocuments(options, function(err2, data2)
		{
			return
		})
	})



}



