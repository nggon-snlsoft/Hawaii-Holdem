import { _decorator, Component, Node, Button, EditBox, Label, AudioSource, AudioClip, director, Scene, game, Sprite, EventHandler, input, Input, EventKeyboard, KeyCode } from 'cc';
import { ENUM_RESULT_CODE, NetworkManager } from './NetworkManager';
import { Main } from './Main';
import { CommonUtil } from './CommonUtil';
import { LoginSystemPopup } from './Login/LoginSystemPopup';
import { ResourceManager } from './ResourceManager';
import { ENUM_LEAVE_REASON, GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('UiLogin')
export class UiLogin extends Component {
    @property (EditBox) editBoxUID: EditBox = null;
    @property (EditBox) editBoxPassword: EditBox = null;    
    @property (Label) labelLoginState: Label = null;
    @property (AudioSource) audioSource: AudioSource = null;
    @property (AudioClip) soundButtonClick: AudioClip = null;

    @property (Button) buttonLogin: Button = null;
    @property (Button) buttonJoin: Button = null;
    @property (Button) buttonExit: Button = null;

    @property (Sprite) spriteEventBlocker: Sprite = null;

    private main: Main = null;

    init(main: Main) {
        this.main = main;

        NetworkManager.Instance().logout();
        GameManager.Instance().SetShowEventPopup( true );
        this.RegistEditboxEvent();

        this.spriteEventBlocker.node.active = false;

        this.buttonLogin.node.on( "click", this.onClickLogin.bind( this ), this );
        this.buttonJoin.node.on('click', this.onClickJoin.bind( this ), this );
        this.buttonExit.node.on('click', ()=>{

            LoginSystemPopup.instance.showPopUpYesOrNo('종료', '게임을 종료하시겠습니까?', ()=>{
                this.exitGame();
            }, ()=>{
                LoginSystemPopup.instance.closePopup();
            });

        }, this);
    }

    RegistEditboxEvent() {

        this.editBoxUID.node.on('editing-did-began', this.onUID_EDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxUID.node.on('editing-return', this.onUID_EDITBOX_RETURN.bind(this), this);
        this.editBoxUID.node.on('text-changed', this.onUID_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxUID.node.on('editing-did-ended', this.onUID_EDITBOX_DID_ENDED.bind(this), this);

        this.editBoxPassword.node.on('editing-did-began', this.onPASSWORD_EDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxPassword.node.on('editing-return', this.onPASSWORD_EDITBOX_RETURN.bind(this), this);
        this.editBoxPassword.node.on('text-changed', this.onPASSWORD_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxPassword.node.on('editing-did-ended', this.onPASSWORD_EDITBOX_DID_ENDED.bind(this), this);
    }

    onUIDEditboxReturn() {
        console.log('onUIDEditboxReturn');
    }

    onUIDEditboxChanged( text: string, editbox: EditBox, customEventData: any ) {
        console.log('onUIDEditboxChanged');
        console.log( text );

        // console.log('text: ' + text + 'is input');
        // if ( /\t/gi.test( text) == true ) {
        //     console.log( '[[' + text.trim() + ']]');


        //     this.editBoxPassword.focus();
        //     editbox.string = text.trim();
        //     editbox.textLabel.string = text.trim();            
        // }
    }

    onUIDEditboxDidBegan() {
        this.editBoxUID.string = '';
    }

    onPasswordEditboxReturn() {

        if ( this.editBoxPassword.string.length > 0 && this.editBoxUID.string.length > 0 ) {
            this.audioSource.playOneShot(this.soundButtonClick, 1);
            this.onLogin();
        }
    }

    onPasswordEditboxChanged() {

    }

    onPasswordEditboxDidBegan() {
        this.editBoxPassword.string = '';
    }
    
    onClickLogin(button: Button) {
        this.audioSource.playOneShot(this.soundButtonClick, 1);
        this.onLogin();
	}

    public exitGame() {
        director.end();
        game.end();
    }

    onLogin() {
        let login_id: string = this.editBoxUID.string;
        let password: string = this.editBoxPassword.string;

        this.buttonLogin.interactable = false;
        this.buttonJoin.interactable = false;

        this.spriteEventBlocker.node.active = true;

        if ( login_id.length < 4 || login_id.length == 4 ) {
            LoginSystemPopup.instance.showPopUpOk('로그인', '아이디와 패스워드를 입력해주세요.', ()=>{
                this.buttonLogin.interactable = true;
                this.buttonJoin.interactable = true;
                this.spriteEventBlocker.node.active = false;
                LoginSystemPopup.instance.closePopup();
            });
            return;
        }

		NetworkManager.Instance().reqLOGIN_HOLDEM( login_id, password ,(res)=>{
            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {

                let id: number = res.obj.id;
                this.onLoadInitialData( id );
            }
            else {
                let desc: string = '';
                switch ( res.msg ) {
                    case 'INVALID_UID':
                        desc = '잘못된 아이디 입니다.';
                        break;
                    case 'NO_EXIST_LOGIN_ID':
                        desc = '아이디가 존재하지 않습니다.';
                        break;
                    case 'NO_MATCH_PASSWORD':
                        desc = '비밀번호가 맞지 않습니다.';
                        break;
                    case 'DISABLE_ACCOUNT':
                        desc = '사용할 수 없는 계정입니다.';
                        break;
                    case 'PENDING_ACCOUNT':
                        desc = '가입 대기중인 계정입니다.';
                        break;
                    default:
                        desc = '로그인 할 수 없습니다.';
                }

                LoginSystemPopup.instance.showPopUpOk('로그인', desc, ()=>{
                    this.buttonLogin.interactable = true;
                    this.buttonJoin.interactable = true;

                    this.spriteEventBlocker.node.active = false;
                });
            }
        },
        ( err )=>{
            if ( err.code == ENUM_RESULT_CODE.DISCONNECT_SERVER ) {
                LoginSystemPopup.instance.showPopUpOk('로그인', '서버에 연결할 수 없습니다.', ()=>{
                    this.buttonLogin.interactable = true;
                    this.buttonJoin.interactable = true;

                    this.spriteEventBlocker.node.active = false;
                });
                return;        
            }
            else {
                LoginSystemPopup.instance.showPopUpOk('로그인', '로그인 할 수 없습니다.', ()=>{
                    this.buttonLogin.interactable = true;
                    this.buttonJoin.interactable = true;

                    this.spriteEventBlocker.node.active = false;
                });
            }
        });        
    }

    private onLoadInitialData( user_id: number ) {
        NetworkManager.Instance().getINIT_DATA(user_id, (res)=>{

            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                if ( res.user != null && res.setting != null && res.conf != null ) {
                    CommonUtil.setGameSetting( res.conf );

                    ResourceManager.Instance().loadAvatars( res.conf.avatars, ()=>{}, ()=>{
                        director.loadScene("LobbyScene", (error: null | Error, scene?: Scene)=>{
                        
                        }, ()=>{
            
                        });
    
                    });
                } else {
                    LoginSystemPopup.instance.showPopUpOk('로그인', '게임 정보를 불러올 수 없습니다.', ()=>{
                        this.spriteEventBlocker.node.active = false;

                        LoginSystemPopup.instance.closePopup();
                    });
                }
            } else {
                LoginSystemPopup.instance.showPopUpOk('로그인', '게임 정보를 불러올 수 없습니다.', ()=>{
                    this.spriteEventBlocker.node.active = false;

                    LoginSystemPopup.instance.closePopup();
                });
            }

            this.buttonLogin.interactable = true;
            this.buttonJoin.interactable = true;

        }, ( err )=>{
            LoginSystemPopup.instance.showPopUpOk('로그인', '게임 정보를 불러올 수 없습니다.', ()=>{
                this.spriteEventBlocker.node.active = false;

                LoginSystemPopup.instance.closePopup();
            });

            this.buttonLogin.interactable = true;
            this.buttonJoin.interactable = true;
        });
    }

    onClickJoin() {
        this.main.onShowJoinMember();
    }

    show() {
        let leaveReason = GameManager.Instance().GetLeaveReason();
        if ( leaveReason == ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE ) {
            LoginSystemPopup.instance.showPopUpOk('로그인', '중복 로그인이 발생했습니다.', ()=>{
                LoginSystemPopup.instance.closePopup();

                this.exitGame();
            });
        } else if ( leaveReason == ENUM_LEAVE_REASON.LEAVE_VERSION_MISMATCH ) {
            LoginSystemPopup.instance.showPopUpOk('버전', '버전이 맞지 않습니다. \n새로운 버전을 설치하세요.', ()=>{
                LoginSystemPopup.instance.closePopup();

                this.exitGame();
            });
        }

        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    private onUID_EDITBOX_RETURN( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        editbox.string = editbox.string.trim();
    }

    private onUID_EDITBOX_DID_BEGAN( editbox, customEventData ) {
        editbox.string = '';
    }

    private onUID_EDITBOX_DID_ENDED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
    }

    private onUID_EDITBOX_TEXT_CHANGED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        let c = '\t';
        if ( editbox.string.includes(c) == true ) {
            editbox.blur();
            // this.editBoxPassword.focus();
        }
        editbox.string = editbox.string.trim();
    }

    private onPASSWORD_EDITBOX_DID_BEGAN( editbox, customEventData ) {
        editbox.string = '';
    }    

    private onPASSWORD_EDITBOX_RETURN( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        editbox.string = editbox.string.trim();
        if ( editbox.string.length > 0 && editbox.string.length > 0 ) {
            this.audioSource.playOneShot(this.soundButtonClick, 1);
            this.onLogin();
        }
    }

    private onPASSWORD_EDITBOX_DID_ENDED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
    }

    private onPASSWORD_EDITBOX_TEXT_CHANGED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        let c = '\t';
        if ( editbox.string.includes(c) == true ) {
            editbox.blur();
            // this.editBoxUID.focus();
        }        
        editbox.string = editbox.string.trim();
    }
}
