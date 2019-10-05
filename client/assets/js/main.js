$(document).ready(function() {
  isAuth()
})

function isAuth() {
  if (localStorage.getItem('token')) {
    // $('#loginName').append(`${localStorage.getItem('name')}`)
    $('#loginName').html(`${localStorage.getItem('name')}`)
    $('.loginView').show()
    $('#registerSection').hide()
    $('#loginSection').hide()
  } else {
    $('.loginView').hide()
    $('#loginName').empty()
    $('#registerSection').show()
    $('#loginSection').show()
    $('#registerSection').hide()
  }
}

$('#registerForm').on('submit', async function(e) {
  try {
    e.preventDefault()
    swal.fire({
      title: 'Creating an account...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: user } = await axios({
      method: 'post',
      url: 'http://localhost:3000/users/register',
      data: {
        email: `${$('#registerEmail').val()}`,
        password: `${$('#registerPassword').val()}`
      }
    })
    $('#registerEmail').val('')
    $('#registerPassword').val('')

    localStorage.setItem('token', user.token)
    localStorage.setItem('name', user.name)

    swal.close()
  } catch (err) {
    const { data } = err.response

    let title = data

    if (Array.isArray(data)) {
      title = data.join('\n')
    }

    swal.fire({
      type: 'error',
      title,
      showConfirmButton: true
    })
  }
})

async function onSignIn(googleUser) {
  try {
    const id_token = googleUser.getAuthResponse().id_token

    const { data } = await axios({
      method: 'post',
      url: 'http://localhost:3000/users/gsignin',
      data: {
        token: id_token
      }
    })

    localStorage.setItem('token', data.token)
    localStorage.setItem('name', data.name)
    isAuth()
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance()
  auth2.signOut().then(function() {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    isAuth()
  })
  swal.fire({
    type: 'success',
    title: 'Logged out',
    timer: 1000,
    showConfirmButton: false
  })
  localStorage.removeItem('token')
  localStorage.removeItem('name')
  isAuth()
}

function registerBtn() {
  $('#loginSection').show()
  $('#registerSection').hide()
}

function loginBtn() {
  $('#registerSection').show()
  $('#loginSection').hide()
}
