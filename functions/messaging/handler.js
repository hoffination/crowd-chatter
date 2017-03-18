'use strict'

var merge = require('ramda').merge
var dao = require('./dao')

var responseTemplate = {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

// GET endpoint to pull top 200 messages
module.exports.getMessages = (event, context, callback) => {
  dao.getMessages()
    .then((items) => {
      var response = {
        body: JSON.stringify({
          message: 'Successfully gathered messages',
          messages: items
        })
      }
      callback(null, merge(responseTemplate, response))
    }, (err) => {
      console.error(err)
      var response = {
        statusCode: 500,
        body: JSON.stringify({message: 'Error handling request'})
      }
      return callback(null, merge(responseTemplate, response))
    })
}

// PUT endpoint to create a message
module.exports.createMessage = (event, context, callback) => {
  // Check to see if the request has all parameters
  if (!event || !event.queryStringParameters || !event.queryStringParameters.author || !event.queryStringParameters.message) {
    var response = {
      statusCode: 400,
      body: JSON.stringify({message: 'Request missing required parameters'})
    }
    return callback(null, merge(responseTemplate, response))
  }

  dao.insertNewMessage({
    presentation: 'ServerlessTalk',
    author: event.queryStringParameters.author,
    message: event.queryStringParameters.message,
    timestamp: Date.now()
  }).then(() => {
    var response = {
      body: JSON.stringify({message: 'Successfully submitted message'})
    }
    callback(null, merge(responseTemplate, response))
  }, (err) => {
    console.error(err)
    var response = {
      statusCode: 500,
      body: JSON.stringify({message: 'Error handling request'})
    }
    return callback(null, merge(responseTemplate, response))
  })
}
