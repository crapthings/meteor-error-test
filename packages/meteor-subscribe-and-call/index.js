const { subscribe, call, apply } = Meteor

const React = require('react')
const { render } = require('react-dom')

const { withTracker } = require('meteor/react-meteor-data')

const ErrorState = new ReactiveVar({})

const ErrorComponent = ({ children, error, reason, details }) => {
  if (!error)
    return null

  return children ? children : (
    <div>
      <div>{error}</div>
      <div>{reason}</div>
      <div>{details}</div>
      <button>close</button>
    </div>
  )
}

const ErrorContainer = props => {
  const { error, reason, details } = ErrorState.get()
  return { error, reason, details }
}

const ErrorView = withTracker(ErrorContainer)(ErrorComponent)

const onStop = err => {
  ErrorState.set(err)
}

Meteor.wsubscribe = function () {
  let args = [...arguments]
  const [callbackObjExist] = [...arguments].slice(-1)
  if (!callbackObjExist.onStop)
    args.push({ onStop })
  return subscribe.apply(subscribe, args)
}

Meteor.startup(function () {
  const $div = document.createElement('div')
  document.body.appendChild($div)
  render(<ErrorView />, $div)
})
