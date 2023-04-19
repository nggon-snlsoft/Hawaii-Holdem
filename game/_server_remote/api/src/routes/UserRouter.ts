import bodyParser from 'body-parser';
import express from 'express';
import * as UserController from '../controllers/UserController';

const router = express.Router();

router.post( '/', ( req, res )=>{
    res.send('Ok');
});

router.post( '/auth', UserController.auth);

export default router;