import { Router } from 'express'

const router = Router()
router.get('/', (req, res) => {
res.render('index', { title: 'Hello User' })
})
export default router