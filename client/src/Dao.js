import request from 'request'
import leftpad from 'left-pad'

var messageAPI = 'https://n7f3f2y74m.execute-api.us-west-2.amazonaws.com/dev/message'

// example result: [{author: 'Ben', message: 'Hello World', timestamp: '9:20'}]
function getMessages () {
  return new Promise(function (resolve, reject) {
    request.get(messageAPI, function (err, res) {
      if (err) {
        reject(err)
      } else {
        var response = JSON.parse(res.body)
        console.debug(response.message)

        // Format data for display
        response.messages = response.messages.map(m => {
          m.timestamp = getFormattedTimestamp(m.timestamp)
          m.style = {
            background: getColorFromString(m.author)
          }
          return m
        })

        resolve(response.messages)
      }
    })
  })
}

function sendMessage (message) {
  return new Promise(function (resolve, reject) {
    request.put(messageAPI + '?' + queryFormatData(message), function (err, res) {
      if (err) {
        reject(err)
      } else {
        var response = JSON.parse(res.body)
        console.debug(response.message)
        resolve()
      }
    })
  })
}

function getFormattedTimestamp (utcTime) {
  return new Date(utcTime).getHours() + ':' + leftpad(new Date(utcTime).getMinutes(), 2, 0)
}

function queryFormatData (data) {
  return Object.keys(data).map(key => {
    return key + '=' + data[key] + '&'
  }).join('')
}

// Adapted from Jeff Foster - http://stackoverflow.com/questions/11120840/hash-string-into-rgb-color
function getColorFromString (name) {
  var hash = getHashCode(name.toLowerCase())
  var r = leftpad(((hash & 0xFF0000) >> 16).toString(16), 2, 0)
  var g = leftpad(((hash & 0x00FF00) >> 8).toString(16), 2, 0)
  var b = leftpad((hash & 0x0000FF).toString(16), 2, 0)
  return '#' + r + g + b
}

// lordvlad - http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
function getHashCode (s) {
  return s.split('')
    .reduce(function (a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
}

export default {getMessages, sendMessage, getFormattedTimestamp, getColorFromString}
