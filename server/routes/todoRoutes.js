const router = require('express').Router()
const { TodoController } = require('../controllers')
const { authentication, authorization } = require('../middlewares/auth')

router.use(authentication)
router.get('/', TodoController.index)
router.post('/create', TodoController.create)

router.use(authorization)
router.put('/edit/:todoId', TodoController.update)
router.delete('/delete/:todoId', TodoController.delete)
router.get('/show/:todoId', TodoController.show)

module.exports = router
