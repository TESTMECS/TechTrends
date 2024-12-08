import express from 'express';
import { handleRouteError, validate, validateWithType } from '../utils/Error';
import { getArticleOfTheWeek } from '../data/articles';

declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}


const router = express.Router();

router.route('/').get(async (req, res) => {
    // maybe redisify to expire at the next monday 12AM?
    try {
        const article = await getArticleOfTheWeek();
        res.status(200).send({ data: article });
    } catch (error) {
        handleRouteError(error, res);
    }
    return;
})

export { router as articleOTWRouter };