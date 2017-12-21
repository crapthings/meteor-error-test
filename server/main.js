Meteor.publish('test', function () {
  throw new Meteor.Error('something wrong')
})
