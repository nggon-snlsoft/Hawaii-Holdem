import { _decorator, Component, Node, Label, Button, director, Game, Scene } from 'cc';
import { UiLobbyBottom } from './Lobby/UiLobbyBottom';
import { UiLobbyPopup } from './Lobby/UiLobbyPopup';
import { UiPlayer } from './Lobby/UiPlayer';
import { UiTableList } from './Lobby/UiTableList';
import { LobbySystemPopup } from './LobbySystemPopup';
import { NetworkManager } from "./NetworkManager";
import {Board} from "./Board";
import {UiTable} from "./UiTable";
import { UiLobbyLoading } from './Lobby/UiLobbyLoading';
import { LobbyAudioContoller } from './Lobby/LobbyAudioContoller';
const { ccclass, property } = _decorator;

@ccclass('UiLobby')
export class UiLobby extends Component {

    @property(UiPlayer) uiPlayer: UiPlayer = null;
    @property(UiTableList) uiTableList: UiTableList = null;
    @property(UiLobbyPopup) uiLobbyPopup: UiLobbyPopup = null;
    @property(UiLobbyBottom) uiLobbyBottom: UiLobbyBottom = null;
    @property(UiLobbyLoading) uiLobbyLoading: UiLobbyLoading = null;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonSetting: Button = null;

	private userInfo : any = null;
    private settingInfo: any = null;

    public init() {
        this.uiLobbyPopup.init( this );

        this.uiPlayer.init( this.onShowAvartProfile.bind(this) );
        this.uiTableList.init( this.onJoinTable.bind(this) );
        this.uiLobbyLoading.init();
        
        this.uiLobbyBottom.init( 
            this.onShowQuickJoin.bind(this), 
            this.onShowPoint.bind(this), 
            this.onShowRanking.bind(this), 
            this.onShowCharge.bind(this), 
            this.onShowTransfer.bind(this));

        this.buttonSetting.node.on("click", this.onShowSetting.bind(this), this);
        this.buttonExit.node.on('click', this.onClickExit.bind(this), this);

        this.node.active = true;
    }

    show() {
        this.userInfo = NetworkManager.Instance().getUserInfo();
        this.settingInfo = NetworkManager.Instance().getUserSetting();

        if (this.userInfo != null)
        {
            this.uiPlayer.show();            
            this.uiTableList.show();
            // this.uiLobbyBottom.show();
        }

        this.node.active = true;
    }

    public refreshPlayer() {
        NetworkManager.Instance().refreshUser(()=>{
            this.uiPlayer.refresh();

        }, ()=>{

        });
    }

    public refreshUiPlayer() {
        this.uiPlayer.refresh();        
    }

    private onShowAvartProfile() {
        this.uiLobbyPopup.openProfile();
    }

    private onClickExit( button: Button ) {
        LobbyAudioContoller.instance.playButtonClick();

        LobbySystemPopup.instance.showPopUpYesOrNo('로그아웃', '로그아웃 하시겠습니까?', ()=>{
            NetworkManager.Instance().logout();
            director.loadScene("LoginScene",
            (error: null | Error, scene?: Scene )=>{

            },
            ()=>{

            });

        }, ()=>{
            LobbySystemPopup.instance.closePopup();
        })
    }

    private onShowSetting( button: Button ) {
        LobbyAudioContoller.instance.playButtonClick();

        button.interactable = true;
        this.uiLobbyPopup.openSetting();
    }

    private onShowQuickJoin( button: Button ) {
        button.interactable = true;        
        this.uiLobbyPopup.openQuickJoin();
    }

    private onShowPoint( button: Button ) {
        button.interactable = true;        
        this.uiLobbyPopup.openPoint();
    }

    private onShowRanking( button: Button ) {
        button.interactable = true;        
        this.uiLobbyPopup.openRanking();
    }

    private onShowCharge( button: Button ) {
        button.interactable = true;
        this.uiLobbyPopup.openCharge();
    }

    private onShowTransfer( button: Button ) {
        button.interactable = true;
        this.uiLobbyPopup.openTransfer();
    }

    private onJoinTable(table: any) {
        let user = NetworkManager.Instance().getUserInfo();
        if ( user != null ) {
            if (user.balance < table.info.minStakePrice) {
                LobbySystemPopup.instance.showPopUpOk("바이인", "바이인 금액이 부족합니다.", ()=>{

                });

            } else {
                NetworkManager.Instance().reqJoinRoom( table.id, (room, info, count)=>{
                    this.uiLobbyLoading.show();

                    Board.isPublic = true;
                    Board.id = Number(table.id);
                    Board.setInfo(info.info);
                    Board.room = room;
                    UiTable.seatMaxFromServer = count;

                    director.loadScene("GameScene",
                        (error: null | Error, scene?: Scene )=>{

                        },
                        ()=>{

                        });

                }, (msg, code, exitLobby)=>{
                    if ( code == 400 ) {
                        LobbySystemPopup.instance.showPopUpOk('로그인', '이미 참여중인 테이블 입니다.', ()=>{

                        });
                    }
                     else {
                        console.log('UNKNOWN_ERROR');
                    }
                });
            }
        }
    }
}


