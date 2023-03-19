import { _decorator, Component, Node } from 'cc';
import { NetworkResponse } from './NetworkResponse';
const { ccclass, property } = _decorator;

export enum ENUM_RESULT_CODE {
    UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 1,
}

export class NetworkManager {
    private static instance: NetworkManager = null;
    private requestUrl: string = 'http://127.0.0.1: 2600/';
    private sessionID: string = '';
    private isLogin: boolean = false;
    private cbExpired: ()=> void = null;
    private cookie = '';

    private loadingIndicator: NetworkResponse = null;

    constructor() {
        console.log('CREATE_NETWORK_MANAGER');
    }

    public static Instance(): NetworkManager {
        if ( this.instance == null ) {
            this.instance = new NetworkManager();
        }
        return this.instance;
    }

    public init( url: string, cbExpired: ()=>{}) {
        console.log(url);
        this.requestUrl = url;
        this.cbExpired = cbExpired;
    }

    public setLoadingIndicator( loadingIndicator: NetworkResponse ) {
        if ( loadingIndicator != null ) {
            this.loadingIndicator = loadingIndicator;
            this.loadingIndicator.init();
        }
    }

    public reqLogin( code: string, onSuccess: ( res: string )=>void, onFail: ( err: string )=>void ) {
        this.SendHttpRequst('admin/login', { pins: code }, 
        (result)=>{
            this.isLogin = true;
            onSuccess( result );
        }, (err)=>{
            this.isLogin = false;
            onFail(err)
        });
    }

    private SendHttpRequst(endpoint: string, body: any, cbSuccess: (res)=> void, cbFail: (err: string, relogin: boolean )=>void ) {
        console.log (endpoint);

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState == 4) {

                this.loadingIndicator.deallocate();
                if (xhr.responseText != null && xhr.responseText.length > 0) {

                    let json = JSON?.parse(xhr.responseText);
                    console.log(json);
                    if ( json.code != ENUM_RESULT_CODE.SUCCESS ) {
                        console.log('NOT ENUM_RESULT_CODE.SUCCESS');

                        if ( cbFail == null ) {
                            return;
                        }



                        let isExpiredSession: boolean = (json.code == ENUM_RESULT_CODE.EXPIRED_SESSION);
                        if ( isExpiredSession == true ) {
                            this.sessionID = '';
                            this.isLogin = false;

                            if ( this.cbExpired != null ) {
                                this.cbExpired();
                            }
                        }
                        cbFail( json.message, isExpiredSession );
                        return;
                    }

                    cbSuccess( json );

                } else {
                    if ( cbFail != null ) {
                        cbFail('NETWORK_ERROR', false);
                    }
                }
            }
        }

        xhr.onerror = ( e )=> {
            this.loadingIndicator.deallocate();
            cbFail('WEB_REQUEST_ERROR: ' + e, false );
        }

        xhr.ontimeout = ( e ) => {
            this.loadingIndicator.deallocate();
            cbFail('WEB_REQUEST_TIMEOUT' + e, false );
        }

        this.loadingIndicator.allocate();

        xhr.open( 'POST', this.requestUrl + endpoint, true );
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.send(JSON.stringify(body));
    }
}


