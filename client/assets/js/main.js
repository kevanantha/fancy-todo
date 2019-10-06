$(document).ready(function() {
  if (window.location.search) {
    const query = window.location.search.substring(1)
    const token = query.split('token=')[1].split('&')[0]
    const name = query
      .split('name=')[1]
      .split('&')[0]
      .split('%20')
      .join(' ')
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('name', name)
      window.location = 'http://localhost:8080'
    }
  }

  isAuth()
  if (localStorage.getItem('token')) {
    index()
  }
})

function isAuth() {
  if (localStorage.getItem('token')) {
    $('#loginName').html(`Welcome, ${localStorage.getItem('name')}`)
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
    if (todos.length) {
      $('#index').append(`
        <div>
          <h2 class="mb-4 text-monospace">
            <span class="fa fa-check text-success"></span> ${localStorage.getItem('name')}'s Todos
          </h2>
        </div>
      `)
      todos.forEach(todo => {
        $('#index').append(`
          <ul class="list-group list-group-flush text-left">
            <li class="list-group-item p-3" style="display: flex; align-items: center">
              <input type="checkbox" class="mr-3 checkbox" ${
                todo.status ? 'checked' : ''
              } onclick="todoStatus('${todo._id}')">
              <div class="text-dark text-decoration-none mr-auto" style="cursor: pointer" onclick="showTodo('${
                todo._id
              }')">
                <h5 class="m-0">
                  ${todo.status ? `<s>${todo.name}</s>` : todo.name}
                </h5>
              </div>
              <div class="text-muted small badge badge-info text-wrap m-0 mr-3" style="width: 5.7rem">
                <p class="text-white m-0">
                  Due Date ${todo.due_date ? moment(todo.due_date).format('MMM Do YY') : ''}
                </p>
              </div>
              <i class="fa fa-edit fa-lg mr-2 text-primary" style="cursor: pointer" onclick="editTodo('${
                todo._id
              }')"></i>
              <i class="fa fa-trash fa-lg text-danger" style="cursor: pointer" onclick="deleteTodo('${
                todo._id
              }')"></i>
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

async function showTodo(id) {
  swal.fire({
    title: 'Fetching Data...',
    onOpen() {
      swal.showLoading()
    }
  })

  const { data: todo } = await axios({
    method: 'get',
    url: `http://localhost:3000/todos/show/${id}`,
    headers: {
      access_token: localStorage.getItem('token')
    }
  })

  swal.close()

  swal.fire({
    title: 'Detail Todo',
    html: `
      <div class="text-left">
        <h5 class="font-weight-bold">Title</h5>
        <p>${todo.name}</p>
        <h5 class="font-weight-bold">Description</h5>
        <p>${todo.description.replace(/\n/g, '<br />')}</p>
        <h5 class="font-weight-bold">Status</h5>
        ${
          todo.status
            ? '<p class="text-success">Completed</p>'
            : '<p class="text-danger">Uncompleted</p>'
        }
        <h5 class="font-weight-bold">Last Update</h5>
        <p>${moment(todo.updatedAt).format('MMM Do YYYY, h:mm:ss a')}</p>
        <h5 class="font-weight-bold">Created At</h5>
        <p>${moment(todo.createdAt).format('MMM Do YYYY, h:mm:ss a')}</p>
      </div>
    `,
    padding: '3rem',
    showCloseButton: true,
    confirmButtonText: 'Close'
  })
}

async function deleteTodo(id) {
  try {
    const result = await swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.value) {
      swal.fire({
        title: 'Deleting...',
        onOpen() {
          swal.showLoading()
        }
      })

      await axios({
        method: 'delete',
        url: `http://localhost:3000/todos/delete/${id}`,
        headers: {
          access_token: localStorage.getItem('token')
        }
      })

      let text
      const { data: joke } = await axios({
        method: 'get',
        url: 'https://sv443.net/jokeapi/category/any?blacklistFlags=religious'
      })

      swal.close()

      if (joke.type == 'twopart') {
        text = [joke.setup, joke.delivery]
      } else {
        text = [joke.joke]
      }

      await swal.fire({
        title: `Todo Deleted Successfully\n\n here's a ${joke.category.toLowerCase()} joke fo ya`,
        text: text.join('\n'),
        showConfirmButton: true
      })
      index()
    }
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function todoStatus(id) {
  try {
    swal.fire({
      title: 'Updating...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: todo } = await axios({
      method: 'get',
      url: `http://localhost:3000/todos/show/${id}`,
      headers: {
        access_token: localStorage.getItem('token')
      }
    })

    await axios({
      method: 'put',
      url: `http://localhost:3000/todos/edit/${id}`,
      headers: {
        access_token: localStorage.getItem('token')
      },
      data: {
        status: !todo.status
      }
    })

    let text
    const { data: joke } = await axios({
      method: 'get',
      url: 'https://sv443.net/jokeapi/category/any?blacklistFlags=religious'
    })

    swal.close()

    if (joke.type == 'twopart') {
      text = [joke.setup, joke.delivery]
    } else {
      text = [joke.joke]
    }

    await swal.fire({
      title: `Todo Updated Successfully\n\n here's a ${joke.category.toLowerCase()} joke fo ya`,
      text: text.join('\n'),
      showConfirmButton: true
    })
    index()
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function editTodo(id) {
  swal.fire({
    title: 'Fetching Data...',
    onOpen() {
      swal.showLoading()
    }
  })
  const { data: todo } = await axios({
    method: 'get',
    url: `http://localhost:3000/todos/show/${id}`,
    headers: {
      access_token: localStorage.getItem('token')
    }
  })
  swal.close()

  await swal.fire({
    title: 'Edit Todo',
    html:
      `<label for="name">Name</label>` +
      `<input id="name" value="${todo.name}" placeholder="Name" class="swal2-input">` +
      `<label for="name">Description</label>` +
      `<textarea id="description" placeholder="Description" class="swal2-textarea">${todo.description}</textarea>` +
      `<label for="name">Due Date</label>` +
      `<input
        id="due_date"
        value="${moment(todo.due_date).format('YYYY-MM-DD')}"
        type="date" class="swal2-input">`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Update',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      const data = [
        document.getElementById('name').value,
        document.getElementById('description').value,
        document.getElementById('due_date').value
      ]

      try {
        const { data: todo } = await axios({
          method: 'put',
          url: `http://localhost:3000/todos/edit/${id}`,
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

        await swal.fire({
          title: `Todo Updated Successfully\n\n here's a ${joke.category.toLowerCase()} joke fo ya`,
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

async function addTodo() {
  const { value: formValues } = await Swal.fire({
    title: 'Create Todo',
    html:
      `<label for="name">Name</label>` +
      '<input id="name" placeholder="Name" class="swal2-input">' +
      `<label for="name">Description</label>` +
      '<textarea id="description" placeholder="Description" class="swal2-textarea"></textarea>' +
      `<label for="name">Due Date</label>` +
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
