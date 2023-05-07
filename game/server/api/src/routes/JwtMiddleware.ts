import { Request, Response } from "express";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { ENUM_RESULT_CODE } from "../main";
import { sqlProxy } from "../modules/sqlProxy";

declare module 'express' {
    interface Request {
        jwtParsed?: any
    }
}

export const SECRET_KEY = 'snlsoft09!@';
export const TOKEN_LIFTTIME = '3h';

const bypassTokenVerify: boolean = false;

export async function VerifyToken( req: Request, res: Response, next: any ) {
    if ( bypassTokenVerify == true ) {
        next();
        return;
    }

    if ( req.headers['token'] == null ) {
        return res.status( 401 ).json ({
            result: ENUM_RESULT_CODE.UNKNOWN_FAIL,
            msg: 'INVALID REQUEST'
        });
    }
    let parseToken: JwtPayload = null;

    try{
        parseToken = TryParseToken( req.headers['token']);

    } catch ( error ) {
        console.error( error );
    }

    let error: boolean = false;
    if ( parseToken == null ) {
        let newToken = sign ({
            uid: User.id,
            iat: Date.now(),

        }, SECRET_KEY, {

        });

        res.setHeader( 'new-token', newToken );
        next();
        return;
    }

    req.body.parsedUID = parseToken["uid"];
    next();    
}

export function TryParseToken( token: any): JwtPayload {
    let result: JwtPayload = null;
    try {
        result = verify( token, SECRET_KEY ) as JwtPayload;
    } catch ( error ) {

    }

    return result;
}

export class RestoreTokenInfo {
    public loginToken: string = '';
}

export function RestoreToken( userId: string ): RestoreTokenInfo {
    let tokenInfo = new RestoreTokenInfo();
    tokenInfo.loginToken = sign( {
        uid: userId,
        iat: Date.now()
        
    }, SECRET_KEY, {
        expiresIn: TOKEN_LIFTTIME,
        issuer: 'hawaiiholdemLogin'
    });
    return tokenInfo;
}