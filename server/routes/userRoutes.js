const router = require('express').Router()
const { UserController } = require('../controllers')
const { authentication } = require('../middlewares/auth')

router.get('/', authentication, UserController.index)
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/gsignin', UserController.gsignin)
router.get('/github', UserController.github)

module.exports = router
