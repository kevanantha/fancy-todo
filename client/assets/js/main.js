$(document).ready(function() {
  isAuth()
  if (localStorage.getItem('token')) {
    index()
  }
})

function isAuth() {
  if (localStorage.getItem('token')) {
    $('#loginName').html(`${localStorage.getItem('name')}`)
    $('.loginView').show()
    $('#registerSection').hide()
    $('#loginSection').hide()
    $('#navbar').show()
    $('#index').show()
  } else {
    $('.loginView').hide()
    $('#index').hide()
    $('#navbar').hide()
    $('#loginName').empty()
    $('#registerSection').show()
    $('#loginSection').show()
    $('#registerSection').hide()
  }
}

async function index() {
  try {
    $('#index').empty()
    swal.fire({
      title: 'Fetching Data...',
      onOpen() {
        swal.showLoading()
      }
    })
    const { data: todos } = await axios({
      method: 'get',
      url: 'http://localhost:3000/todos',
      headers: {
        access_token: localStorage.getItem('token')
      }
    })
    console.log(todos)
    if (todos.length) {
      $('#index').append(`
        <div class="card-header">
          ${localStorage.getItem('name')}'s Todos
        </div>
      `)
      todos.map(todo => {
        return $('#index').append(`
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <a href="http://localhost:3000/todos/${todo._id}">
                ${todo.name}
              </a>
            </li>
          </ul>
        `)
      })
    } else {
      $('#index').append(`
        <h4>You don't have todos</h4>
      `)
    }
    swal.close()
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function addTodo() {
  const { value: formValues } = await Swal.fire({
    title: 'Multiple inputs',
    html:
      '<input id="name" class="swal2-input">' +
      '<textarea id="description" class="swal2-textarea"></textarea>' +
      '<input id="due_date" type="date" class="swal2-input">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Create',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      const data = [
        document.getElementById('name').value,
        document.getElementById('description').value,
        document.getElementById('due_date').value
      ]

      try {
        const { data: todo } = await axios({
          method: 'post',
          url: 'http://localhost:3000/todos/create',
          headers: {
            access_token: localStorage.getItem('token')
          },
          data: {
            name: data[0],
            description: data[1],
            due_date: data[2]
          }
        })
        let text
        const { data: joke } = await axios({
          method: 'get',
          url: 'https://sv443.net/jokeapi/category/any?blacklistFlags=religious'
        })
        if (joke.type == 'twopart') {
          text = [joke.setup, joke.delivery]
        } else {
          text = [joke.joke]
        }
        console.log(joke)

        await swal.fire({
          title: `Todo Created Successfully\n\n here's a ${joke.category.toLowerCase()} joke fo ya`,
          text: text.join('\n'),
          showConfirmButton: true
        })
        index()
      } catch (err) {
        swal.showValidationMessage(err.response.data.join(' and '))
      }
    },
    allowOutsideClick: () => !swal.isLoading()
  })
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

    $('#registerEmail').val('')
    $('#registerPassword').val('')

    swal.fire({
      type: 'error',
      title,
      showConfirmButton: true
    })
  }
})

$('#loginForm').on('submit', async function(e) {
  try {
    e.preventDefault()
    swal.fire({
      title: 'Logging in...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: user } = await axios({
      method: 'post',
      url: 'http://localhost:3000/users/login',
      data: {
        email: `${$('#loginEmail').val()}`,
        password: `${$('#loginPassword').val()}`
      }
    })
    $('#loginEmail').val('')
    $('#loginPassword').val('')

    localStorage.setItem('token', user.token)
    localStorage.setItem('name', user.name)

    isAuth()
    index()
    swal.close()
  } catch (err) {
    const { data } = err.response

    let title = data

    if (Array.isArray(data)) {
      title = data.join('\n')
    }

    $('#loginEmail').val('')
    $('#loginPassword').val('')

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
    index()
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
  $('#index').empty()
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