module.exports = (err, req, res, next) => {
  let status
  let message

  switch (err.name) {
    case 'hello':
      console.log('asdf')
      break
  }
}
