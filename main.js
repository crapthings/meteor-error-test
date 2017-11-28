import SimpleSchema from 'simpl-schema'
import React, { Component } from 'react'
import { render } from 'react-dom'

const OutputErrorTo = ({ elementId = 'error-component', error, reason, details }) => {
  const $ErrorComponent = document.getElementById(elementId)
  $ErrorComponent && ($ErrorComponent.innerText = `error: ${error} ${reason} ${details}`)
}

const originalMeteorError = Meteor.Error
Meteor.Error = function (error, reason, details) {
  if (Meteor.isClient) {
    Meteor.isDevelopment && console.log(this)
    OutputErrorTo({ error, reason, details })
  }

  if (Meteor.isServer) {
    console.log(...arguments)
  }
  Meteor.defer(() => { /* put to our own log server */ })
  return originalMeteorError.apply(this, arguments)
}

if (Meteor.isClient) {
  const originalMeteorSubscribe = Meteor.subscribe
  Meteor.subscribe = function () {
    let { onStop } = arguments[arguments.length - 1]
    Meteor.isClient && OutputErrorTo({ ...arguments })
    if (onStop)
      return originalMeteorSubscribe.apply(this, arguments)

    onStop = (err) => OutputErrorTo({ ...err })
    const args = [...arguments, { onStop }]
    return originalMeteorSubscribe.apply(this, args)
  }
}

const Users = Meteor.users
const Groups = new Mongo.Collection('groups')
const GroupMembers = new Mongo.Collection('groupmembers')
const Issues = new Mongo.Collection('issues')
const IssueMembers = new Mongo.Collection('issuemembers')

// schema 插入和更新时的确认规则
Issues.attachSchema(new SimpleSchema({
  title: {
    type: String,
  },

  userId: {
    type: String,
    autoValue() {
      return Meteor.userId()
    },
  },

  groupId: {
    type: String,
    custom() {
      if (!Groups.findOne(this.value))
        return '组织机构不存在'
    }
  },
}))

// 报错方法
Meteor.methods({
  'create.issue'(props) {
    return Issues.insert(props)
  },

  'test1'(props) {
    throw new Meteor.Error('500', '方法错误', '方法错误详情')
  },
})

// 报错 publish
if (Meteor.isServer) {
  Meteor.publish('undefined1', function () {
    throw new Meteor.Error('404', '啥啥没找到', '没找到详情')
  })
}

// 测试报错 ui
if (Meteor.isClient) {
  const ErrorComponent = () => <div id='error-component'></div>
  Meteor.startup(function () {
    const app = document.createElement('div')
    document.body.appendChild(app)
    render(<div>
      <ErrorComponent />
      <button onClick={() => Meteor.call('create.issue', { title: 'this is a title' })}>方法错误 schema failed</button>
      <button onClick={() => Meteor.call('create.issue', { title: 'this is a title', groupId: '123' })}>groupId不存在 groupId 123</button>
      <button onClick={() => Meteor.call('test1')}>方法错误内 throw</button>
      <button onClick={() => Meteor.subscribe('undefined1')}>订阅错误1</button>
      <button onClick={() => Meteor.subscribe('undefined2', { test: 1 }, { test: 2 }, { test: 2 }, )}>订阅错误2带参数</button>
      <button onClick={() => Meteor.subscribe('undefined2', { onStop(err) { OutputErrorTo({ error: 500, reason: '不知道', details: 'oh yeah' }) } }, )}>订阅报错自定</button>
      <button onClick={() => {
        throw new Meteor.Error(500, '自定报错', '报错详情')
        alert('我不应该执行')
      }}>new Meteor.Error</button>
    </div>, app)
  })
}
