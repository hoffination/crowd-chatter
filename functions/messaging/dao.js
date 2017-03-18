'use strict'

var AWS = require('aws-sdk')
var DOC_CLIENT = new AWS.DynamoDB.DocumentClient()
var omit = require('ramda').omit
var Filter = require('bad-words')

module.exports.getMessages = () => {
  return new Promise((resolve, reject) => {
    var docParams = {
      TableName: 'Chats',
      ScanIndexForward: false,
      Limit: 200,
      KeyConditionExpression: '#presentation = :presentation AND #time > :minimum',
      ExpressionAttributeNames: {
        '#presentation': 'presentation',
        '#time': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':presentation': 'ServerlessTalk',
        ':minimum': 0
      }
    }

    DOC_CLIENT.query(docParams, function (err, data) {
      if (err) {
        reject('Unable to get documents. Error: ' + JSON.stringify(err, null, 2))
      } else {
        // Return data omitting the presentation implementation detail
        resolve(data.Items.map(item => omit(['presentation'], item)))
      }
    })
  })
}

module.exports.insertNewMessage = (message) => {
  // Flag potentially bad words
  var filter = new Filter()
  message.nsfw = filter.isProfane(message.message)

  // Insert new message into the database
  return new Promise((resolve, reject) => {
    var docParams = {
      TableName: 'Chats',
      Item: message
    }

    DOC_CLIENT.put(docParams, function (err, data) {
      if (err) {
        reject('Unable to add item. Error: ' + JSON.stringify(err, null, 2))
      } else {
        resolve()
      }
    })
  })
}
