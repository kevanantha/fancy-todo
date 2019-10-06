const router = require('express').Router()
const { TodoController } = require('../controllers')
const { authentication, authorizationTodo } = require('../middlewares/auth')

router.use(authentication)
router.get('/', TodoController.index)
router.post('/create', TodoController.create)

router.put('/edit/:todoId', authorizationTodo, TodoController.update)
router.delete('/delete/:todoId', authorizationTodo, TodoController.delete)
router.get('/show/:todoId', authorizationTodo, TodoController.show)

module.exports = router
