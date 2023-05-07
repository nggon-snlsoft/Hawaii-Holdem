// @ts-ignore
import * as cc from "cc";
import { _decorator, Component, Node } from 'cc';
const { ccclass } = cc._decorator;

export enum ENUM_DEVICE_TYPE {
    MOBILE_PORTRAIT = 0,
    PC_LANDSCAPE = 1,
}

const CLIENT_VERSION: string = '4';

@ccclass('GameManager')
export class GameManager extends cc.Component {
    private version: string = '';
    private deviceType: ENUM_DEVICE_TYPE = ENUM_DEVICE_TYPE.MOBILE_PORTRAIT;

    private static _instance : GameManager = null;

    public static Instance() : GameManager
	{
		if(null == this._instance){
			this._instance = new GameManager();
		}
		
		return this._instance;
	}

    public Init() {
        this.version = CLIENT_VERSION;
        this.deviceType = ENUM_DEVICE_TYPE.MOBILE_PORTRAIT;
        // this.deviceType = ENUM_DEVICE_TYPE.PC_LANDSCAPE;        
    }

    public GetInfo(): any {
        return {
            device: this.deviceType,
            version: this.version,
        };
    }

    public GetVersion() : string {
        return this.version;
    }
}


