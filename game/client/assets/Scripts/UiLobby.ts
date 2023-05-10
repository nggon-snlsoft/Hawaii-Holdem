import { _decorator, Component, Node, Label, Button, director, Game, Scene, sys } from 'cc';
import { UiLobbyBottom } from './Lobby/UiLobbyBottom';
import { UiLobbyPopup } from './Lobby/UiLobbyPopup';
import { UiPlayer } from './Lobby/UiPlayer';
import { UiTableList } from './Lobby/UiTableList';
import { LobbySystemPopup } from './LobbySystemPopup';
import { NetworkManager } from "./NetworkManager";
import { Board } from "./Board";
import { UiTable } from "./UiTable";
import { UiLobbyLoading } from './Lobby/UiLobbyLoading';
import { LobbyAudioContoller } from './Lobby/LobbyAudioContoller';
import { GameManager } from './GameManager';
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

	private user : any = null;
    private setting: any = null;
    private cbEnd: ()=> void = null; 

    public init() {
        this.uiLobbyPopup.init( this );

        this.uiPlayer.init( this.onShowAvartProfile.bind(this) );
        this.uiTableList.init( this.onJoinTable.bind(this) );
        this.uiLobbyLoading.init();
        
        this.uiLobbyBottom.init( this.onSHOW_POINT.bind(this), this.onSHOW_RANKING.bind(this), this.onSHOW_CHARGE.bind(this), 
            this.onSHOW_TRANSFER.bind(this), this.onSHOW_QND.bind(this), this.onSHOW_NOTICE.bind(this) );

        this.buttonSetting.node.off("click");
        this.buttonSetting.node.on("click", this.onShowSetting.bind(this), this);

        this.buttonExit.node.off('click');
        this.buttonExit.node.on('click', this.onClickExit.bind(this), this);
        this.node.active = true;
    }

    show( cbEnd: ()=> void ) {
        if ( this.cbEnd != null ) {
            this.cbEnd = null;

            if ( cbEnd != null ) {
                this.cbEnd = cbEnd;
            }
        }

        this.user = NetworkManager.Instance().GetUser();
        this.setting = NetworkManager.Instance().GetSetting();

        if (this.user != null)
        {
            this.uiPlayer.show();            
            this.uiTableList.show();
            this.uiLobbyBottom.show();
        }

        this.ShowEventPopup();

        let leaveReason = NetworkManager.Instance().leaveReason;
        if ( leaveReason == 4001 ) {
            leaveReason = -1;            
            LobbySystemPopup.instance.showPopUpOk('테이블', '장시간 자리비움으로 테이블을 떠났습니다.', ()=>{

            });
        }

        this.node.active = true;
    }

    private ShowEventPopup() {
        NetworkManager.Instance().getPOPUPS((res)=>{
            if ( res != null ) {
                let popups: any[] = null;
                let tickets: any[] = null;

                if ( res.popups != null ) {
                    popups = res.popups;
                    popups.sort( (e1: any, e2: any )=>{
                        if ( e1.store_id > e2.store_id ) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                }

                if ( res.tickets != null ) {
                    tickets = res.tickets;
                    tickets.sort( (e1: any, e2: any )=>{
                        if ( e1.createDate > e2.createDate ) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                }

                let showEventPopup = GameManager.Instance().GetShowEventPopup();
                if ( sys.isBrowser != true ) {
                    if ( showEventPopup == true && popups != null && popups.length > 0 ) {
                        this.uiLobbyPopup.OpenEventPopup( popups, ()=>{
                            GameManager.Instance().SetShowEventPopup( false );
                            this.uiLobbyPopup.CloseEventPopup();
                            this.ShowTicketResult( tickets );
                        } );
                    } else if ( tickets != null && tickets.length > 0 ) {
                        this.ShowTicketResult( tickets );
                    }
                } else {
                    if ( tickets !=null && tickets.length > 0 ) {
                        this.ShowTicketResult( tickets );
                    }
                }
            }

        }, (err)=>{

        });
    }

    private ShowTicketResult( tickets: any ) {
        if ( tickets != null ) {
            if ( tickets.length > 0 ) {
                this.uiLobbyPopup.OpenTicketsPopup( tickets, ()=>{
                    this.uiLobbyPopup.CloseTicketsPopup();
                });
            } else {

            }
        }
    }

    public refreshPlayer() {
        NetworkManager.Instance().getUSER_FromDB( ()=>{
            this.uiPlayer.refresh();
        }, ()=>{

        })
    }

    public refreshUiPlayer() {
        this.uiPlayer.refresh();        
    }

    private onShowAvartProfile() {
        this.uiLobbyPopup.openProfile();
    }

    private onClickExit( button: Button ) {
        LobbyAudioContoller.instance.PlayButtonClick();

        LobbySystemPopup.instance.showPopUpYesOrNo('로그아웃', '로그아웃 하시겠습니까?', ()=>{
            this.uiTableList.end();
            NetworkManager.Instance().logout();

            if ( this.cbEnd != null ) {
                this.cbEnd();

                this.cbEnd = null;
            }

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
        LobbyAudioContoller.instance.PlayButtonClick();

        button.interactable = true;
        this.uiLobbyPopup.openSetting();
    }

    private onJoinTable(table: any) {
        let user = NetworkManager.Instance().GetUser();
        if ( user != null ) {
            if (user.balance < table.minBuyIn ) {
                LobbySystemPopup.instance.showPopUpOk("바이인", "바이인 금액이 부족합니다.", ()=>{

                });

            } else {
                NetworkManager.Instance().reqENTER_TABLE( table.id, ( room, res )=>{
                    this.uiTableList.end();
                    
                    Board.isPublic = true;
                    Board.id = res.info.id;
                    Board.ante = res.info.ante;

                    Board.setInfo( res.info );
                    Board.room = room;
                    UiTable.seatMaxFromServer = res.count;

                    this.uiLobbyLoading.show( ()=>{
                        if ( this.cbEnd != null ) {
                            this.cbEnd();
                            this.cbEnd = null;
                        }
                    });

                }, ( err )=>{
                    switch ( err.msg ) {
                        case 'DUPLICATE_LOGIN':
                            LobbySystemPopup.instance.showPopUpOk("테이블입장", "이미 플레이중인 테이블이 있습니다.", ()=>{
                                LobbySystemPopup.instance.closePopup();
                            });                            
                            break;
                        case 'INCORRECT_TABLE_INFO':
                            LobbySystemPopup.instance.showPopUpOk("테이블입장", "해당 테이블에 입장할 수 없습니다.", ()=>{
                                LobbySystemPopup.instance.closePopup();
                            });                                                        
                            break;
                        case 'TABLE_IS_FULL':
                            LobbySystemPopup.instance.showPopUpOk("테이블입장", "테이블이 가득 찼습니다.", ()=>{
                                LobbySystemPopup.instance.closePopup();
                            });                                                                                    
                            break;                            
                        default:
                            LobbySystemPopup.instance.showPopUpOk("테이블입장", "해당 테이블에 입장할 수 없습니다.\n" + err.msg, ()=>{
                                LobbySystemPopup.instance.closePopup();
                            });                                                                                    
                    }

                });
            }
        }
    }

    private onSHOW_POINT( button: Button ) {
        this.uiLobbyPopup.OpenPoint( button );
    }

    private onSHOW_RANKING( button: Button ) {
        this.uiLobbyPopup.OpenRanking( button );
    }

    private onSHOW_CHARGE( button: Button ) {
        this.uiLobbyPopup.OpenCharge( button );
    }

    private onSHOW_TRANSFER( button: Button ) {
        this.uiLobbyPopup.OpenTransfer( button );
    }

    private onSHOW_QND( button: Button ) {
        this.uiLobbyPopup.OpenQNA( button );
    }

    private onSHOW_NOTICE( button: Button ) {

        this.uiLobbyPopup.OpenNotice( button );
    }

    public onEVENT_SHOW() {
        console.log('onEVENT_SHOW');
    }

    public onEVENT_HIDE() {
        console.log('onEVENT_HIDE');
    }
}


