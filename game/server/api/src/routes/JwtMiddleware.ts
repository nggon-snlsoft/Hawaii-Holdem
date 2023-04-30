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
export const REFRESH_TOKEN_LIFETIME = '3d';

const bypassTokenVerify: boolean = false;

export async function VerifyToken( req: Request, res: Response, next: any ) {
    if ( bypassTokenVerify == true ) {
        next();
        return;
    }

    if ( req.headers['token'] == null || req.headers['refreshtoken'] == null ) {
        console.error(' token or refresh token is null ');
        return res.status( 401 ).json ({
            result: ENUM_RESULT_CODE.UNKNOWN_FAIL,
            msg: 'INVALID REQUEST'
        });
    }

    let parseToken: JwtPayload = null;
    let parseRefreshToken: JwtPayload = null;

    try{
        parseToken = TryParseToken( req.headers['token']);
        parseRefreshToken = TryParseToken( req.headers['refreshtoken']);

    } catch ( error ) {
        console.error( error );
    }

    let error: boolean = false;
    if ( parseToken == null ) {
        if ( parseRefreshToken == null ) {
            return res.status(401).json({
                result: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'RELOGIN_REQUIRED'                
            });
        }

        // await sqlProxy.Instance().queryAsync("select * from account where refreshToken = \"" + req.headers["refreshtoken"] + "\"", null, (err, result) => {
        //     if (null != err){
        //         console.error(err);
        //         error = true;
        //         return;
        //     }

        //     if(result.length < 1){  
        //         error = true;
        //         return;
        //     }

        //     user = result[0];
        // });

        // if(error != false){
        //     //refresh token not expired but can't find on database
        //     return res.status(401).json({ resultCode : eResultCode.FAIL, message : "relogin Required" });
        // }

        let newToken = sign ({
            uid: User.id,
            iat: Date.now(),

        }, SECRET_KEY, {

        });

        res.setHeader( 'new-token', newToken );
        // req.body.parseUID = user._id;
        next();
        return;
    }

    if( parseRefreshToken == null ){

        let user : any = null;

        if (false != error) {
            return res.status(401).json({
                result: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'RELOGIN_REQUIRED'
            });
        }

        // token is fine but Refresh token is expired
        let newRefreshToken = sign({ uid : user._id }, SECRET_KEY, {
            expiresIn : REFRESH_TOKEN_LIFETIME,
            issuer : "creverseRefreshToken"
        });

        //let error = false;

        // await sqlProxy.Instance().queryAsync("update account set refreshToken = \"" + newRefreshToken + "\" where uid = " + parseToken["uid"], null, (err, result)=>{
        //     if(null != err){
        //         console.error(err);
        //         error = true;
        //         return;
        //     }

        //     console.log(result);
        // });

        //req.body.newRefreshToken = newRefreshToken;
        res.setHeader("new-refresh-token", newRefreshToken);
        
        req.body.parsedUID = parseToken["uid"];
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
    public refreshToken: string = '';
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

    tokenInfo.refreshToken = sign( {
        uid: userId
    }, SECRET_KEY, {
        expiresIn: REFRESH_TOKEN_LIFETIME,
        issuer: 'hawaiiholdemRefreshToken'
        
    });
    return tokenInfo;
}