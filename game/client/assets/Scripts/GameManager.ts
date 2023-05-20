// @ts-ignore
import * as cc from "cc";
import { _decorator, Component, Node, director, Scene } from 'cc';
import { ENUM_CURRENT_SCENE, ENUM_DEVICE_TYPE, ENUM_LEAVE_REASON } from "./HoldemDefines";
import { NetworkManager } from "./NetworkManager";
const { ccclass } = cc._decorator;

const CLIENT_VERSION: string = '4';

@ccclass('GameManager')
export class GameManager extends cc.Component {
    private version: string = '';
    private deviceType: ENUM_DEVICE_TYPE = ENUM_DEVICE_TYPE.MOBILE_PORTRAIT;
    private static _instance : GameManager = null;
    private leaveReason: ENUM_LEAVE_REASON = ENUM_LEAVE_REASON.LEAVE_UNKNOWN;
    private currentScene: ENUM_CURRENT_SCENE = ENUM_CURRENT_SCENE.LOGIN_SCENE;
    private showEventPopup: boolean = false;

    public static Instance() : GameManager
	{
		if(null == this._instance){
			this._instance = new GameManager();
		}
		
		return this._instance;
	}

    public Init() {
        this.showEventPopup = true;

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

    public SetVersion( version: string ) {
        this.version = version;
    }

    public SetDeviceType( type: ENUM_DEVICE_TYPE) {
        this.deviceType = type;
    }    

    public SetCurrentScene( scene: ENUM_CURRENT_SCENE ) {
        this.currentScene = scene;
    }

    public GetShowEventPopup() {
        return this.showEventPopup;
    }

    public SetShowEventPopup( show: boolean ) {
        this.showEventPopup = show;
    }

    public ForceExit( leaveReason: ENUM_LEAVE_REASON ) {
        this.leaveReason = leaveReason;

        switch ( this.leaveReason ) {
            case ENUM_LEAVE_REASON.LEAVE_NONE:
                break;
            case ENUM_LEAVE_REASON.LEAVE_VERSION_MISMATCH:
            case ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE:
            case ENUM_LEAVE_REASON.LEAVE_LONG_AFK:                
                director.loadScene("LoginScene", (error: null | Error, scene?: Scene)=>{
                    NetworkManager.Instance().logout();
                });
                break;
            default:
        }
    }

    public ResetLeaveReason() {
        this.leaveReason = ENUM_LEAVE_REASON.LEAVE_NONE;
    }

    public GetLeaveReason() {
        return this.leaveReason;
    }
}


