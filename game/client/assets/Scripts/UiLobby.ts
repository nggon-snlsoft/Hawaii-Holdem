import { _decorator, Component, Node, Label, Button, director, Game, Scene, sys, Sprite } from 'cc';
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
import { Platform } from '../../extensions/colyseus-sdk/runtime/colyseus';
import { GameManager } from './GameManager';
import { ENUM_LEAVE_REASON } from './HoldemDefines';
import { CommonUtil } from './CommonUtil';
import { ENUM_EVENT_POPUP_TYPE } from './Lobby/UiLOBBY_POPUP_EVENT';
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
    @property(Sprite) spriteBlocker: Label = null;

	private user : any = null;
    private setting: any = null;
    private cbEnd: ()=> void = null;
    private canRefresh: boolean = false; 
    private onHideTimestamp: number = 0;

    public init() {
        this.uiLobbyPopup.init( this );

        this.uiPlayer.init( this.onShowAvartProfile.bind(this) );
        this.uiTableList.init( this.onJoinTable.bind(this), this.EXIT_LOBBY.bind( this ) );
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

        this.spriteBlocker.node.active = false;

        this.canRefresh = true;
        this.user = NetworkManager.Instance().GetUser();
        this.setting = NetworkManager.Instance().GetSetting();
        this.onHideTimestamp = 0;

        if (this.user != null)
        {
            this.uiPlayer.show();            
            this.uiTableList.show();
            this.uiLobbyBottom.show();
        }

        let leaveReason = NetworkManager.Instance().leaveReason;
        if ( leaveReason == 4001 ) {
            LobbySystemPopup.instance.showPopUpOk('테이블', '장시간 자리비움으로 테이블을 떠났습니다.', ()=>{

            });
        } else if ( leaveReason == 4002 ) {
            LobbySystemPopup.instance.showPopUpOk('테이블', '게임을 이용할 수 없습니다.', ()=>{
                this.EXIT_LOBBY();

            });
        }

        NetworkManager.Instance().leaveReason = -1;
        this.CheckEventPopup();


        this.node.active = true;
    }

    private CheckEventPopup() {
        let isSHOW_POPUP = GameManager.Instance().GetShowEventPopup();
        if ( isSHOW_POPUP == false ) {
            this.canRefresh = true;
            this.onREFRESH();
            this.onREGIST_SCHEDULE();
            return;
        }

        NetworkManager.Instance().getPOPUPS(( res )=>{
            if ( res != null ) {
                let popups: any[] = res.popups;

                if ( popups != null && popups.length > 0 ) {
                    this.uiLobbyPopup.OpenEventPopup( popups, ( type: ENUM_EVENT_POPUP_TYPE )=>{
                        if ( type == 1 ) {
                            if ( this.user.tester == 1 ) {
                                this.uiLobbyPopup.CloseEventPopup();
                                GameManager.Instance().SetShowEventPopup( false );
                                this.canRefresh = true;
    
                                this.onREFRESH();
                                this.onREGIST_SCHEDULE();
                            } else {
                                this.EXIT_LOBBY();                                
                            }
                        } else {
                            this.uiLobbyPopup.CloseEventPopup();
                            GameManager.Instance().SetShowEventPopup( false );
                            this.canRefresh = true;

                            this.onREFRESH();
                            this.onREGIST_SCHEDULE();
                        }
                    });
                } else {
                    this.canRefresh = true;
                    this.onREFRESH();
                    this.onREGIST_SCHEDULE();
                }
            }
        }, (err)=>{
            this.canRefresh = true;
            this.onREFRESH();
            this.onREGIST_SCHEDULE();
        });
    }

    // private SetUnreadAnswer( count: number ) {
    //     this.uiLobbyBottom.SetUnreadBadge( count );
    // }

    private SetUnreadMessage( count: number ) {
        this.uiLobbyBottom.SetUnreadBadge( count );
    }

    private ShowTicketResult( tickets: any, done: ()=>void ) {
        if ( tickets != null ) {
            if ( tickets.length > 0 ) {
                this.uiLobbyPopup.OpenTicketsPopup( tickets, ()=>{
                    this.uiLobbyPopup.CloseTicketsPopup();
                    if ( done != null ) {
                        done();
                    }
                });
            } else {
                if ( done != null ) {
                    done();
                }
            }
        } else {
            if ( done != null ) {
                done();
            }
        }
    }

    private ShowPointReceives( logs: any, done: ()=>void ) {
        if ( logs != null ) {
            if ( logs.length > 0 ) {
                this.uiLobbyPopup.OpenPointsReceivesPopup( logs, ()=>{
                    this.uiLobbyPopup.ClosePointsReceives();
                    if ( done != null ) {
                        done();
                    }
                });
            } else {
                if ( done != null ) {
                    done();
                }
            }
        } else {
            if ( done != null ) {
                done();
            }
        }
    }    

    public refreshPlayer() {
        NetworkManager.Instance().getUSER_FromDB( ()=>{
            this.uiPlayer.refresh();
        }, ()=>{

        })
    }

    private onREGIST_SCHEDULE() {
        this.schedule( ()=>{
            this.onREFRESH();
        }, 5);
    }

    private onUNREGIST_SCHEDULE() {
        this.unscheduleAllCallbacks();
    }

    private onREFRESH() {        
        if ( this.uiLobbyPopup.IsOpen() == true || LobbySystemPopup.instance.IsPOPUP_SHOW() == true || this.canRefresh == false ) {
            return;
        }

        NetworkManager.Instance().reqREFRESH((res: any )=>{
            if ( res != null ) {
                if ( res.user != null && res.user.disable == 1) {
                    GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_DISABLE_ACCOUNT );
                    this.EXIT_LOBBY();
                    return;
                }

                this.refreshPlayer();
                this.SetUnreadMessage( res.unreads );
                this.ShowTicketResult( res.tickets, ()=>{
                    if ( res.point_receives != null && res.point_receives.length > 0 ) {
                        this.ShowPointReceives( res.point_receives, ()=>{

                        } );
                    }
                } );
            }
        }, (err: any )=>{
            console.log(err);
        });

        this.uiTableList.getTableList();
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

            this.EXIT_LOBBY();
        }, ()=>{
            LobbySystemPopup.instance.closePopup();
        })
    }

    private onShowSetting( button: Button ) {
        LobbyAudioContoller.instance.PlayButtonClick();

        button.interactable = true;
        this.uiLobbyPopup.openSetting();
    }

    private onJoinTable(button: Button, table: any) {
        NetworkManager.Instance().reqENTER_TABLE( table.id, ( room, res )=>{
            button.interactable = true;
            this.canRefresh = false;
            this.uiTableList.end();
            
            Board.isPublic = true;
            Board.id = res.info.id;
            Board.ante = res.info.ante;
            Board.ip = res.ip;

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
            button.interactable = true;

            switch ( err.msg ) {
                case 'NOT_ENOUGHT_BALANCE':
                    let desc = '소지금이 부족합니다.\n' + '소지금: ' + CommonUtil.getKoreanNumber( err.balance ) + '\n' + '최소바이인: ' + CommonUtil.getKoreanNumber( err.buyin );

                    LobbySystemPopup.instance.showPopUpOk("테이블입장", desc, ()=>{
                        LobbySystemPopup.instance.closePopup();
                    });                            
                    break;                
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
                case 'DISABLE_ACCOUNT':
                    GameManager.Instance().ForceExit(ENUM_LEAVE_REASON.LEAVE_DISABLE_ACCOUNT);
                    this.EXIT_LOBBY();
                    break;                    
                case 'TABLE_IS_FULL':
                    LobbySystemPopup.instance.showPopUpOk("테이블입장", "테이블이 가득 찼습니다.", ()=>{
                        LobbySystemPopup.instance.closePopup();
                    });                                                                                    
                    break;
                case 'TABLE_DUPLICATE_IP':
                    LobbySystemPopup.instance.showPopUpOk("테이블입장", "중복된 IP의 플레이어가 있습니다.", ()=>{
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
        let now: any = new Date();
        let ts = Number(now);

        if ( ts - this.onHideTimestamp > 1000 * 60 * 10 ) {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_LONG_AFK );
        } else {
            this.onHideTimestamp = ts;
            this.onREGIST_SCHEDULE();
        }
        // this.onREGIST_SCHEDULE();
    }

    public onEVENT_HIDE() {
        let now: any = new Date();
        this.onHideTimestamp = Number( now );
        console.log( 'this.onHideTimestamp' + this.onHideTimestamp );

        this.onUNREGIST_SCHEDULE();
    }

    private EXIT_LOBBY() {
        this.spriteBlocker.node.active = true;
        this.uiTableList.end();
        NetworkManager.Instance().logout();

        this.onUNREGIST_SCHEDULE();        
        director.loadScene('LoginScene', ()=>{

        }, ()=>{

        });
    }
}


