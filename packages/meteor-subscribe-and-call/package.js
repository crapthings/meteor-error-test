Package.describe({
  name: 'crapthings:subscribe-call-apply-wrapper',
  summary: 'subscribe, call and apply wrapper',
  version: '0.0.1',
  git: 'https://github.com/crapthings/meteor-subscribe-call-apply'
})

Package.on_use(function (api) {
  api.use(['ecmascript', 'reactive-var', 'react-meteor-data'])
  api.add_files('index.js', 'client')
})
