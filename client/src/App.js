import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import dao from './Dao'
import {prepend, update, set, lensProp} from 'ramda'

class Chat extends Component {
  constructor (props) {
    super(props)
    var _this = this

    function getMessages () {
      dao.getMessages()
        .then((results) => {
          _this.initializeMessages(results)
          setTimeout(getMessages, 19000)
        }, (reason) => {
          console.error(reason)
        })
    }

    this.state = {
      message: '',
      messages: [],
      disabled: false,
      style: {
        background: dao.getColorFromString(this.props.name)
      }
    }

    this.initializeMessages = this.initializeMessages.bind(this)
    this.messageChange = this.messageChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.showNSFW = this.showNSFW.bind(this)

    getMessages()
  }

  render () {
    return (
      <div className='Chat-page'>
        <div className='Chat-name-display'>
          <div className='Chat-color' style={this.state.style} />
          <h3>Hi {this.props.name}</h3>
        </div>
        <form className='mui-form--inline' onSubmit={this.onSubmit}>
          <div className='mui-textfield'>
            <input type='text' placeholder='Say something' value={this.state.message} onChange={this.messageChange} required />
          </div>
          <button className='mui-btn mui-btn--primary' type='submit' disabled={this.state.disabled}>Submit</button>
        </form>
        <br />
        {this.state.messages.map((param, index) => {
          return (
            <div className='Chat-message' key={index.toString()}>
              <div className='Chat-color' style={param.style} />
              <p className='Chat-author'>{param.author}</p>
              {param.nsfw
                ? <div className='Chat-message-content-nsfw'>
                  <p>Possible NSFW content</p>
                  <button className='mui-btn' onClick={this.showNSFW.bind(null, index)}>Show</button>
                </div>
                : <p className='Chat-message-content'>{param.message}</p>
              }
              <p>{param.timestamp}</p>
            </div>
          )
        })}
      </div>
    )
  }

  initializeMessages (messages) {
    this.setState({
      messages: messages
    })
  }

  messageChange (event) {
    this.setState({
      message: event.target.value
    })
  }

  showNSFW (index) {
    this.setState({
      messages: update(index, set(lensProp('nsfw'), false, this.state.messages[index]), this.state.messages)
    })
  }

  onSubmit (e) {
    e.preventDefault()
    this.setState({
      disabled: true
    })

    let newMessage = {
      author: this.props.name,
      message: this.state.message,
      timestamp: dao.getFormattedTimestamp(Date.now()),
      style: {
        background: dao.getColorFromString(this.props.name)
      }
    }
    dao.sendMessage(newMessage)
      .then(() => {
        this.setState({
          messages: prepend(newMessage, this.state.messages),
          message: '',
          disabled: false
        })
      }, (err) => {
        alert(err)
      })
  }
}

class Pages extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: null,
      input: ''
    }

    this.onInputChange = this.onInputChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  render () {
    return (
      <div className='Pages'>
        {!this.state.name
        ? <div className='Pages-login'>
          <p className='App-intro'>
            Sign in to chat with others attending this presentation.
          </p>
          <p>Your name must be longer than one character.</p>
          <form className='mui-form--inline' onSubmit={this.onSubmit}>
            <div className='mui-textfield'>
              <input type='text' placeholder='Name' value={this.state.input} onChange={this.onInputChange} pattern='.{2,}' required />
            </div>
            <button className='mui-btn mui-btn--primary' type='submit'>Welcome</button>
          </form>
        </div>
        : <Chat name={this.state.name} />
        }
      </div>
    )
  }

  onInputChange (event) {
    this.setState({
      input: event.target.value
    })
  }

  onSubmit (e) {
    e.preventDefault()

    this.setState({
      name: this.state.input
    })
  }
}

class App extends Component {
  render () {
    return (
      <div className='App'>
        <div className='App-header'>
          <h1>Crowd Chatter</h1>
          <img src={logo} className='App-logo' alt='logo' />
        </div>
        <Pages />
      </div>
    )
  }
}

export default App
