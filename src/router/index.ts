import userRouter from './user-router'
import authorRouter from './author-router'
import beatRouter from './beat-router'
import mediaRouter from './media-router'
import { Router } from 'express'
import commentRouter from './comment-router'
import tagRouter from './tag-router'

const router = Router()

router.use('/', userRouter)
router.use('/author', authorRouter)
router.use('/beat', beatRouter)
router.use('/media', mediaRouter)
router.use('/comment', commentRouter)
router.use('/tag', tagRouter)

export default router
