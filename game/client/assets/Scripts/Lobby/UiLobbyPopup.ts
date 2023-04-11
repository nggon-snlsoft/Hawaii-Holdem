import { _decorator, Component, Node, color } from 'cc';
import { LobbySystemPopup } from '../LobbySystemPopup';
import { NetworkManager } from '../NetworkManager';
import { UiLobby } from '../UiLobby';
import { UiPopupChangeAvatar } from './UiPopupChangeAvatar';
import { UiPopupCharge } from './UiPopupCharge';
import { UiPopupJoinTable } from './UiPopupJoinTable';
import { UiPopupMakeRoom } from './UiPopupMakeRoom';
import { UiPopupPoint } from './UiPopupPoint';
import { UiPopupProfile } from './UiPopupProfile';
import { UiPopupQuickJoin } from './UiPopupQuickJoin';
import { UiPopupRanking } from './UiPopupRanking';
import { UiPopupSetting } from './UiPopupSetting';
import { UiPopupTransfer } from './UiPopupTransfer';
const { ccclass, property } = _decorator;

@ccclass('UiLobbyPopup')
export class UiLobbyPopup extends Component {
    @property (UiPopupMakeRoom) uiPopupMakeRoom: UiPopupMakeRoom = null;
    @property (UiPopupProfile) uiPopupProfile: UiPopupProfile = null;
    @property (UiPopupSetting) uiPopupSetting: UiPopupSetting = null;    
    @property (UiPopupChangeAvatar) uiPopupChangeAvatar: UiPopupChangeAvatar = null;
    @property (UiPopupQuickJoin) uiPopupQuickJoin: UiPopupQuickJoin = null;
    @property (UiPopupPoint) uiPopupPoint: UiPopupPoint = null;
    @property (UiPopupRanking) uiPopupRanking: UiPopupRanking = null;
    @property (UiPopupCharge) uiPopupCharge: UiPopupCharge = null;
    @property (UiPopupTransfer) uiPopupTransfer: UiPopupTransfer = null;

    private uiLobby: UiLobby = null;

    init( uiLobby:UiLobby ) {

        this.uiPopupMakeRoom.init();
        this.uiPopupProfile.init( this.hide.bind(this), this.openChargeAvatar.bind(this) );
        this.uiPopupSetting.init( this.hide.bind(this), this.applySetting.bind(this) );
        this.uiPopupChangeAvatar.init( this.hideChangeAvatar.bind(this), this.applyChangeAvatar.bind(this));
        this.uiPopupQuickJoin.init( this.hide.bind(this) );
        this.uiPopupPoint.init( this.hide.bind(this) );
        this.uiPopupRanking.init( this.hide.bind(this) );
        this.uiPopupCharge.init( this.hide.bind(this) );
        this.uiPopupTransfer.init( this.hide.bind(this) );

        if ( uiLobby != null ) {
            this.uiLobby = uiLobby;
        }

        this.closeAllPopup();
    }

    public openMakeRoom() {
        this.closeAllPopup();
        
        this.uiPopupMakeRoom.show();
        this.node.active = true;
    }

    public openProfile() {
        this.closeAllPopup();

        this.uiPopupProfile.show();
        this.node.active = true;
    }

    public openSetting() {
        this.closeAllPopup();

        this.uiPopupSetting.show();
        this.node.active = true;
    }

    public openChargeAvatar() {
        this.closeAllPopup();

        this.uiPopupChangeAvatar.show();
        this.node.active = true;
    }

    public openQuickJoin() {
        this.closeAllPopup();

        this.uiPopupQuickJoin.show();
        this.node.active = true;
    }

    public openPoint() {
        this.closeAllPopup();

        this.uiPopupPoint.show();
        this.node.active = true;
    }

    public openRanking() {
        this.closeAllPopup();

        this.uiPopupRanking.show();
        this.node.active = true;
    }

    public openCharge() {
        this.closeAllPopup();

        this.uiPopupCharge.show();
        this.node.active = true;
    }

    public openTransfer() {
        this.closeAllPopup();

        this.uiPopupTransfer.show();
        this.node.active = true;
    }

    public closeMakeRoom() {
        this.uiPopupMakeRoom.hide();
        this.node.active = true;
    }

    public closeProfile() {
        this.uiPopupProfile.hide();
   }

    public closeSetting() {
        this.uiPopupSetting.hide();

        this.hide();
    }

    public closeChangeAvatar() {
        this.uiPopupChangeAvatar.hide();
    }

    public closeQuickJoin() {
        this.uiPopupQuickJoin.hide();
    }

    public closePoint() {
        this.uiPopupPoint.hide();
    }

    public closeRanking() {
        this.uiPopupRanking.hide();
    }

    public closeCharge() {
        this.uiPopupCharge.hide();
    }

    public closeTransfer() {
        this.uiPopupTransfer.hide();
    }    

    public closeAllPopup() {
        this.uiPopupMakeRoom.hide();
        this.uiPopupProfile.hide();
        this.uiPopupSetting.hide();
        this.uiPopupChangeAvatar.hide();
        this.uiPopupQuickJoin.hide();
        this.uiPopupPoint.hide();
        this.uiPopupRanking.hide();
        this.uiPopupCharge.hide();
        this.uiPopupTransfer.hide();

        this.hide();
    }

    private hideChangeAvatar() {
        this.openProfile();
    }

    private applyChangeAvatar( num: number ) {
        NetworkManager.Instance().updateUserAvatar(num, (res)=>{            
            LobbySystemPopup.instance.showPopUpOk('아바타 변경', '아바타가 변경되었습니다.', ()=>{
                this.uiLobby.refreshUiPlayer();
                this.uiPopupChangeAvatar.hide();
                this.openProfile();                
            });
        }, (msg)=>{
            LobbySystemPopup.instance.showPopUpOk('아바타 변경', '아바타가 변경되지 않았습니다.', ()=>{
                this.uiPopupChangeAvatar.hide();
                this.openProfile();                
            });
        });
    }

    private applySetting( selected: any ) {        
        NetworkManager.Instance().updateUserSetting( selected, (res)=>{
            
            LobbySystemPopup.instance.showPopUpOk('설정', '설정이 변경되었습니다.', ()=>{
                LobbySystemPopup.instance.closePopup();
                this.closeSetting();
            });
        }, (err)=>{
            LobbySystemPopup.instance.showPopUpOk('설정', '설정을 변경할 수 없습니다.', ()=>{
                LobbySystemPopup.instance.closePopup();
                this.closeSetting();
            });
        });
    }

    public hide() {
        this.node.active = false;
    }
}