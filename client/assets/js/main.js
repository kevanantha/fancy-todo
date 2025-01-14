$(document).ready(function() {
  console.log("hola, how's it doing? eh?")
  if (window.location.search) {
    const query = window.location.search.substring(1)
    const token = query.split('token=')[1].split('&')[0]
    const name = query
      .split('name=')[1]
      .split('&')[0]
      .split('%20')
      .join(' ')
    const email = query.split('email=')[1].split('&')[0]
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('name', name)
      localStorage.setItem('email', email)
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
      $('#index').append(`
        <div class="text-center mt-5">
          <button type="submit" class="btn btn-primary btn-md loginView" style="width: 25%" onclick="addTodo()">Add Todo</button>
        </div>
      `)
    } else {
      $('#index').append(`
        <h4>You don't have todos</h4>
        <div class="text-center mt-5">
          <button type="submit" class="btn btn-primary btn-md loginView" style="width: 25%" onclick="addTodo()">Add Todo</button>
        </div>
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
  try {
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
        <div class="text-left mt-5">
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
      padding: '5rem',
      showCloseButton: true,
      confirmButtonText: 'Close'
    })
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
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
      padding: '5rem',
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
  try {
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
      padding: '5rem',
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
            padding: '5rem',
            showConfirmButton: true
          })
          index()
        } catch (err) {
          swal.showValidationMessage(err.response.data.join('\n').replace(/\n/g, '<br />'))
        }
      },
      allowOutsideClick: () => !swal.isLoading()
    })
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function addTodo() {
  try {
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
      padding: '5rem',
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
            padding: '5rem',
            showConfirmButton: true
          })
          index()
        } catch (err) {
          swal.showValidationMessage(err.response.data.join('\n').replace(/\n/g, '<br />'))
        }
      },
      allowOutsideClick: () => !swal.isLoading()
    })
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
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
    localStorage.setItem('email', user.email)

    isAuth()
    index()
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
    localStorage.setItem('email', user.email)

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
    localStorage.setItem('email', data.email)
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

async function createProject() {
  try {
    const { data: users } = await axios({
      method: 'get',
      url: 'http://localhost:3000/users',
      headers: {
        access_token: localStorage.getItem('token')
      }
    })

    const options = {}
    users.forEach(user => {
      options[user._id] = user.email
    })

    const { value: projectName } = await swal.fire({
      title: 'Create Project',
      input: 'text',
      showCancelButton: true,
      inputValidator: value => {
        if (!value) {
          return 'Project Name is required'
        }
      }
    })

    if (projectName) {
      const { value: userId } = await swal.fire({
        title: 'Add Members',
        input: 'select',
        inputOptions: options,
        inputPlaceholder: 'Select a member',
        showCancelButton: true,
        cancelButtonText: 'Skip'
      })

      swal.fire({
        title: 'Creating Project...',
        onOpen() {
          swal.showLoading()
        }
      })

      let datas
      if (userId) {
        datas = { name: projectName, members: userId }
      } else {
        datas = { name: projectName }
      }

      const { data: project } = await axios({
        method: 'post',
        url: 'http://localhost:3000/projects/create',
        headers: {
          access_token: localStorage.getItem('token')
        },
        data: datas
      })

      await swal.fire({
        type: 'success',
        title: `Project Created Successfully`,
        padding: '5rem',
        showConfirmButton: true
      })
      projectsBtn()
    }
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function projectsBtn() {
  try {
    swal.fire({
      title: 'Fetching Projects...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: projects } = await axios({
      method: 'get',
      url: 'http://localhost:3000/projects',
      headers: {
        access_token: localStorage.getItem('token')
      }
    })

    const options = {}
    projects.forEach(project => {
      options[project._id] = project.name
    })

    const { value: selectedProject } = await swal.fire({
      title: 'Projects List',
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Select a project',
      showCloseButton: true,
      padding: '5rem'
    })

    if (selectedProject) {
      const { data: project } = await axios({
        method: 'get',
        url: `http://localhost:3000/projects/show/${selectedProject}`,
        headers: {
          access_token: localStorage.getItem('token')
        }
      })
      indexProject(project._id)
    }
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function indexProject(id) {
  try {
    $('#index').empty()

    swal.fire({
      title: 'Fetching Data...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: project } = await axios({
      method: 'get',
      url: `http://localhost:3000/projects/show/${id}`,
      headers: {
        access_token: localStorage.getItem('token')
      }
    })

    if (project.todos.length) {
      $('#index').append(`
        <div>
          <h2 class="mb-4 text-monospace">
            <span class="fa fa-check text-success"></span> ${project.name}'s Todos
          </h2>
        </div>
      `)
      project.todos.forEach(todo => {
        $('#index').append(`
          <ul class="list-group list-group-flush text-left">
            <li class="list-group-item p-3" style="display: flex; align-items: center">
              <input type="checkbox" class="mr-3 checkbox" ${
                todo.status ? 'checked' : ''
              } onclick="projectTodoStatus('${project._id}', '${todo._id}')">
              <div class="text-dark text-decoration-none mr-auto" style="cursor: pointer" onclick="projectShowTodo('${
                project._id
              }', '${todo._id}')">
                <h5 class="m-0">
                  ${todo.status ? `<s>${todo.name}</s>` : todo.name}
                </h5>
              </div>
              <div class="text-muted small badge badge-info text-wrap m-0 mr-3" style="width: 5.7rem">
                <p class="text-white m-0">
                  Due Date ${todo.due_date ? moment(todo.due_date).format('MMM Do YY') : ''}
                </p>
              </div>
              <i class="fa fa-edit fa-lg mr-2 text-primary" style="cursor: pointer" onclick="projectEditTodo('${
                project._id
              }', '${todo._id}')"></i>
              <i class="fa fa-trash fa-lg text-danger" style="cursor: pointer" onclick="projectDeleteTodo('${
                project._id
              }', '${todo._id}')"></i>
            </li>
          </ul>
        `)
      })
      $('#index').append(`
        <div class="text-center mt-5">
          <button
            type="submit"
            class="btn btn-primary btn-md loginView"
            style="width: 25%"
            onclick="projectAddTodo('${project._id}')"
          >
            Add Todo
          </button>
        </div>
        <div class="text-center mt-5">
          ${
            project.owner.email == localStorage.getItem('email')
              ? `<button type="submit" class="btn btn-info btn-md loginView" onclick="inviteMember('${project._id}')">Invite Member</button>`
              : ''
          }
        </div>
      `)
    } else {
      $('#index').append(`
        <h4>You don't have todos</h4>
        <div class="text-center mt-5">
          <button
            type="submit"
            class="btn btn-primary btn-md loginView"
            style="width: 25%"
            onclick="projectAddTodo('${project._id}')"
          >
            Add Todo
          </button>
        </div>
        ${
          project.owner.email == localStorage.getItem('email')
            ? `<div class="text-center mt-5">
                  <button
                    type="submit"
                    class="btn btn-primary btn-md loginView"
                    onclick="inviteMember('${project._id}')"
                  >
                    Invite Member
                  </button>
                </div>`
            : ''
        }
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

async function projectShowTodo(projectId, todoId) {
  try {
    swal.fire({
      title: 'Fetching Data...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: todo } = await axios({
      method: 'get',
      url: `http://localhost:3000/projects/${projectId}/todo/show/${todoId}`,
      headers: {
        access_token: localStorage.getItem('token')
      }
    })

    swal.close()

    swal.fire({
      title: 'Detail Todo',
      html: `
        <div class="text-left mt-5">
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
      padding: '5rem',
      showCloseButton: true,
      confirmButtonText: 'Close'
    })
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function projectTodoStatus(projectId, todoId) {
  try {
    swal.fire({
      title: 'Updating...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: todo } = await axios({
      method: 'get',
      url: `http://localhost:3000/projects/${projectId}/todo/show/${todoId}`,
      headers: {
        access_token: localStorage.getItem('token')
      }
    })

    await axios({
      method: 'put',
      url: `http://localhost:3000/projects/${projectId}/todo/edit/${todoId}`,
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
      padding: '5rem',
      showConfirmButton: true
    })
    indexProject(projectId)
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function projectDeleteTodo(projectId, todoId) {
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
        url: `http://localhost:3000/projects/${projectId}/todo/delete/${todoId}`,
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
      indexProject(projectId)
    }
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function projectEditTodo(projectId, todoId) {
  try {
    swal.fire({
      title: 'Fetching Data...',
      onOpen() {
        swal.showLoading()
      }
    })
    const { data: todo } = await axios({
      method: 'get',
      url: `http://localhost:3000/projects/${projectId}/todo/show/${todoId}`,
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
      padding: '5rem',
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
            url: `http://localhost:3000/projects/${projectId}/todo/edit/${todoId}`,
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
            padding: '5rem',
            showConfirmButton: true
          })
          indexProject(projectId)
        } catch (err) {
          swal.showValidationMessage(err.response.data.join('\n').replace(/\n/g, '<br />'))
        }
      },
      allowOutsideClick: () => !swal.isLoading()
    })
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function projectAddTodo(projectId) {
  try {
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
      padding: '5rem',
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
            url: `http://localhost:3000/projects/${projectId}/todo/create`,
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
            padding: '5rem',
            showConfirmButton: true
          })
          indexProject(projectId)
        } catch (err) {
          swal.showValidationMessage(err.response.data.join('\n').replace(/\n/g, '<br />'))
        }
      },
      allowOutsideClick: () => !swal.isLoading()
    })
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

async function inviteMember(projectId) {
  try {
    swal.fire({
      title: 'Fetching Data...',
      onOpen() {
        swal.showLoading()
      }
    })

    const { data: users } = await axios({
      method: 'get',
      url: 'http://localhost:3000/users',
      headers: {
        access_token: localStorage.getItem('token')
      }
    })

    const options = {}
    users.forEach(user => {
      options[user._id] = user.email
    })

    const { value: userId } = await swal.fire({
      title: 'Add Members',
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Select a member',
      showCancelButton: true
    })

    swal.fire({
      title: 'Adding Member...',
      onOpen() {
        swal.showLoading()
      }
    })

    const d = await axios({
      method: 'put',
      url: `http://localhost:3000/projects/addMember`,
      headers: {
        access_token: localStorage.getItem('token')
      },
      data: {
        projectId,
        userId
      }
    })

    await swal.fire({
      type: 'success',
      title: `Member Invited Successfully`,
      padding: '5rem',
      showConfirmButton: true
    })

    indexProject(projectId)
  } catch (err) {
    swal.fire({
      title: `${err.response.data}`,
      showCloseButton: true
    })
  }
}

function signOut() {
  const auth2 = gapi.auth2.getAuthInstance()
  auth2.signOut().then(function() {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('email')
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
  localStorage.removeItem('email')
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

function backToHome() {
  isAuth()
  index()
}
