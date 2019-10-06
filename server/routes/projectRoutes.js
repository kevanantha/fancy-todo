const router = require('express').Router()
const { ProjectController, TodoController } = require('../controllers')
const { authentication, authorizationProject, authorizationTodo } = require('../middlewares/auth')

router.use(authentication)
router.get('/', ProjectController.index)
router.post('/create', ProjectController.create)
router.put('/addMember', ProjectController.addMember)
router.post('/:projectId/todo/create', ProjectController.createTodo)

router.get('/show/:projectId', authorizationProject, ProjectController.show)
router.get('/:projectId/todo/show/:todoId', authorizationProject, TodoController.show)
router.put('/:projectId/todo/edit/:todoId', authorizationProject, TodoController.update)
router.delete('/:projectId/todo/delete/:todoId', authorizationProject, TodoController.delete)

module.exports = router
