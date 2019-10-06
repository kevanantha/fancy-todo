const router = require('express').Router()
const { ProjectController } = require('../controllers')
const { authentication, authorizationProject } = require('../middlewares/auth')

router.use(authentication)
router.get('/', ProjectController.index)
router.post('/create', ProjectController.create)
router.post('/todo/create', ProjectController.createTodo)

router.get('/show/:projectId', authorizationProject, ProjectController.show)

module.exports = router
