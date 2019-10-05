module.exports = (err, req, res, next) => {
  console.log(err)
  let status
  let message

  switch (err.name) {
    case 'AuthenticationError':
      status = 401
      message = err.message
      break
    case 'ValidationError':
      status = 400
      const arr = []
      for (let key in err.errors) {
        arr.push(err.errors[key].message)
      }
      message = arr
      break
    case 'JsonWebTokenError':
      status = 401
      message = 'Not Authenticated! You must login'
      // message = err.message
      break
    case 'Unauthorized':
      status = 403
      message = err.message
      break
    default:
      status = 500
      message = err.message || err.msg || 'Internal Server Error'
      break
  }

  res.status(status).json(message)
}
