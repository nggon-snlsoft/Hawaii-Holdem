import { _decorator, Component, Node, color, Button } from 'cc';
import { LobbySystemPopup } from '../LobbySystemPopup';
import { NetworkManager } from '../NetworkManager';
import { UiLobby } from '../UiLobby';
import { UiPopupChangeAvatar } from './UiPopupChangeAvatar';
import { UiPopupProfile } from './UiPopupProfile';
import { UiPopupSetting } from './UiPopupSetting';
import { LobbyAudioContoller } from './LobbyAudioContoller';
import { UiLOBBY_POPUP_POINT } from './UiLOBBY_POPUP_POINT';
import { UiLOBBY_POPUP_RANKING } from './UiLOBBY_POPUP_RANKING';
import { UiLOBBY_POPUP_CHARGE } from './UiLOBBY_POPUP_CHARGE';
import { UiLOBBY_POPUP_TRANSFER } from './UiLOBBY_POPUP_TRANSFER';
import { UiLOBBY_POPUP_QnA } from './UiLOBBY_POPUP_QnA';
import { UiLOBBY_POPUP_NOTICE } from './UiLOBBY_POPUP_NOTICE';
import { UiLOBBY_POPUP_EVENT } from './UiLOBBY_POPUP_EVENT';
import { UiLOBBY_POPUP_TICKETS } from './UiLOBBY_POPUP_TICKETS';
const { ccclass, property } = _decorator;

@ccclass('UiLobbyPopup')
export class UiLobbyPopup extends Component {

    @property (UiPopupProfile) uiPopupProfile: UiPopupProfile = null;
    @property (UiPopupSetting) uiPopupSetting: UiPopupSetting = null;    
    @property (UiPopupChangeAvatar) uiPopupChangeAvatar: UiPopupChangeAvatar = null;

    @property (UiLOBBY_POPUP_POINT) uiLOBBY_POPUP_POINT: UiLOBBY_POPUP_POINT = null;
    @property (UiLOBBY_POPUP_RANKING) uiLOBBY_POPUP_RANKING: UiLOBBY_POPUP_RANKING = null;
    @property (UiLOBBY_POPUP_CHARGE) uiLOBBY_POPUP_CHARGE: UiLOBBY_POPUP_CHARGE = null;
    @property (UiLOBBY_POPUP_TRANSFER) uiLOBBY_POPUP_TRANFER: UiLOBBY_POPUP_TRANSFER = null;
    @property (UiLOBBY_POPUP_QnA) uiLOBBY_POPUP_QNA: UiLOBBY_POPUP_QnA = null;
    @property (UiLOBBY_POPUP_NOTICE) uiLOBBY_POPUP_NOTICE: UiLOBBY_POPUP_NOTICE = null;
    @property (UiLOBBY_POPUP_EVENT) uiLOBBY_POPUP_EVENT: UiLOBBY_POPUP_EVENT = null;
    @property (UiLOBBY_POPUP_TICKETS) uiLOBBY_POPUP_TICKETS: UiLOBBY_POPUP_TICKETS = null;            

    private uiLobby: UiLobby = null;

    init( uiLobby:UiLobby ) {
        this.uiPopupProfile.init( this.hide.bind(this), this.openChargeAvatar.bind(this) );
        this.uiPopupSetting.init( this.hide.bind(this), this.applySetting.bind(this) );
        this.uiPopupChangeAvatar.init( this.hideChangeAvatar.bind(this), this.applyChangeAvatar.bind(this));

        if ( uiLobby != null ) {
            this.uiLobby = uiLobby;
        }

        this.uiLOBBY_POPUP_POINT.Init( this.ClosePoint.bind(this), this.applyPointTransfer.bind(this) );
        this.uiLOBBY_POPUP_RANKING.Init( this.CloseRanking.bind(this), null );
        this.uiLOBBY_POPUP_CHARGE.Init( this.CloseCharge.bind(this), null );
        this.uiLOBBY_POPUP_TRANFER.Init( this.CloseTransfer.bind(this), this.onAPPLY_TRANSFER.bind(this) );
        this.uiLOBBY_POPUP_QNA.Init( this.CloseQNA.bind(this), null );
        this.uiLOBBY_POPUP_NOTICE.Init( this.CloseNotice.bind(this), null );
        this.uiLOBBY_POPUP_EVENT.Init();
        this.uiLOBBY_POPUP_TICKETS.Init();

        this.closeAllPopup();
    }

    public OpenEventPopup( popups: any[], done: ()=>void ) {
        this.closeAllPopup();
        this.uiLOBBY_POPUP_EVENT.Show( popups, done );

        this.node.active = true;
    }

    public OpenTicketsPopup( tickets: any[], done: ()=>void ) {
        this.closeAllPopup();
        this.uiLOBBY_POPUP_TICKETS.Show( tickets, done );

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

    public closeAllPopup() {
        this.uiPopupProfile.hide();
        this.uiPopupSetting.hide();
        this.uiPopupChangeAvatar.hide();

        this.uiLOBBY_POPUP_POINT.Hide();
        this.uiLOBBY_POPUP_RANKING.Hide();
        this.uiLOBBY_POPUP_CHARGE.Hide();
        this.uiLOBBY_POPUP_TRANFER.Hide();
        this.uiLOBBY_POPUP_QNA.Hide();
        this.uiLOBBY_POPUP_NOTICE.Hide();
        this.uiLOBBY_POPUP_EVENT.Hide();
        this.uiLOBBY_POPUP_TICKETS.Hide();

        this.hide();
    }

    private hideChangeAvatar() {
        this.openProfile();
    }

    public OpenPoint( button: Button ) {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_POINT.Show( button );

        this.node.active = true;
    }

    public OpenRanking( button: Button ) {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_RANKING.Show( button );

        this.node.active = true;
    }

    public OpenCharge( button: Button ) {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_CHARGE.Show( button );

        this.node.active = true;        
    }

    public OpenTransfer( button: Button ) {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_TRANFER.Show( button );

        this.node.active = true;        
    }

    public OpenQNA( button: Button ) {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_QNA.Show( button );

        this.node.active = true;
    }

    public OpenNotice( button: Button ) {
        this.closeAllPopup();
        this.uiLOBBY_POPUP_NOTICE.Show( button );

        this.node.active = true;
    }

    public ClosePoint() {
        this.uiLOBBY_POPUP_POINT.Hide();
        this.hide();
    }

    public CloseRanking() {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_RANKING.Hide();
        this.hide();
    }

    public CloseCharge() {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_CHARGE.Hide();
        this.hide();
    }

    public CloseTransfer() {
        this.closeAllPopup();        
        this.uiLOBBY_POPUP_TRANFER.Hide();
        this.hide();
    }

    private onAPPLY_TRANSFER() {
        this.closeAllPopup();
        this.uiLOBBY_POPUP_TRANFER.Hide();
        this.uiLobby.refreshUiPlayer();

        this.hide();
    }

    public CloseQNA() {
        this.uiLOBBY_POPUP_QNA.Hide();
        this.hide();
    }

    public CloseNotice() {
        this.uiLOBBY_POPUP_NOTICE.Hide();
        this.hide();
    }
    
    public CloseEventPopup() {
        this.uiLOBBY_POPUP_EVENT.Hide();
        this.hide();
    }

    public CloseTicketsPopup() {
        this.uiLOBBY_POPUP_TICKETS.Hide();
        this.hide();
    }

    private applyChangeAvatar( num: number ) {
        NetworkManager.Instance().updateUSER_AVATAR( num, (res)=>{            
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
        NetworkManager.Instance().updateUSER_SETTING( selected, (res)=>{
            
            LobbySystemPopup.instance.showPopUpOk('설정', '설정이 변경되었습니다.', ()=>{
                LobbySystemPopup.instance.closePopup();
                LobbyAudioContoller.instance.ApplyVolumn();

                this.closeSetting();
            });
        }, (err)=>{
            LobbySystemPopup.instance.showPopUpOk('설정', '설정을 변경할 수 없습니다.', ()=>{
                LobbySystemPopup.instance.closePopup();
                this.closeSetting();
            });
        });
    }

    private applyPointTransfer() {
        this.uiLobby.refreshPlayer();
    }

    public hide() {
        this.node.active = false;
    }
}