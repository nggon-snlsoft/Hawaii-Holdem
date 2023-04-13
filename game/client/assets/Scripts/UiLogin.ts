import { _decorator, Component, Node, Button, EditBox, Label, AudioSource, AudioClip, director, Scene, game, Sprite } from 'cc';
import { ENUM_RESULT_CODE, NetworkManager } from './NetworkManager';
import { Main } from './Main';
import { CommonUtil } from './CommonUtil';
import { LoginSystemPopup } from './Login/LoginSystemPopup';
import { ResourceManager } from './ResourceManager';
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
        if (NetworkManager.Instance().isLogin() == true) {
            
        }

        // this.editBoxUID.node.on('editing-did-began', ( editbox, customEventData )=>{
        //     editbox.string = '';
        // }, this);

        // this.editBoxUID.node.on('editing-did-end', ( editbox, customEventData )=>{
        //     this.editBoxPassword.setFocus();            
        //     editbox.string = '';
        // }, this);        

        // this.editBoxUID.node.on('editing-return', ( editbox, customEventData )=>{
        //     this.editBoxPassword.setFocus();
        // }, this);


        // this.editBoxPassword.node.on('editing-did-began', ( editbox, customEventData )=>{
        //     editbox.string = '';

        // }, this);

        // this.editBoxPassword.node.on('editing-did-began', ( editbox, customEventData )=>{
        //     this.onLogin();

        // }, this);

        // this.editBoxPassword.node.on('editing-return', ( editbox, customEventData )=>{
        //     this.onLogin();
        // }, this);

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
    
    onClickLogin(button: Button) {
        this.audioSource.playOneShot(this.soundButtonClick, 1);
        this.onLogin();
	}

    public exitGame() {
        director.end();
        game.end();
    }

    onLogin() {
        let uid: string = this.editBoxUID.string;
        let pass: string = this.editBoxPassword.string;

        this.buttonLogin.interactable = false;
        this.buttonJoin.interactable = false;

        this.spriteEventBlocker.node.active = true;

        if ( uid.length < 4 || pass.length == 4 ) {
            LoginSystemPopup.instance.showPopUpOk('로그인', '아이디와 패스워드를 입력해주세요.', ()=>{
                this.buttonLogin.interactable = true;
                this.buttonJoin.interactable = true;
                this.spriteEventBlocker.node.active = false;
                LoginSystemPopup.instance.closePopup();
            });
            return;
        }

		NetworkManager.Instance().reqLOGIN_HOLDEM( uid, pass ,(res)=>{
            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {

                let id: number = res.obj.id;
                this.onLoadInitialData( id );
            }
            else {

            }
        },
        ( err )=>{
            if ( err.code == ENUM_RESULT_CODE.DISCONNECT_SERVER ) {
                LoginSystemPopup.instance.showPopUpOk('로그인', '서버에 연결할 수 없습니다.', ()=>{
                    this.buttonLogin.interactable = true;
                    this.buttonJoin.interactable = true;

                    this.spriteEventBlocker.node.active = false;
                    LoginSystemPopup.instance.closePopup();
                });
                return;        
            }
            else {
                this.spriteEventBlocker.node.active = false;

                // let desc: string = '';
                // switch ( res.msg ) {
                //     case 'INVALID_UID':
                //         desc = '잘못된 아이디 입니다.';
                //         break;
                //     case 'NO_EXIST_UID':
                //         desc = '아이디가 존재하지 않습니다.';
                //         break;
                //     case 'NO_MATCH_PASSWORD':
                //         desc = '비밀번호가 맞지 않습니다.';
                //         break;
                //     case 'DISABLE_ACCOUNT':
                //         desc = '사용할 수 없는 계정입니다.';
                //         break;
                //     case 'PENDING_ACCOUNT':
                //         desc = '가입 대기중인 계정입니다.';                        
                //         break;
                //     default:
                // }

                // LoginSystemPopup.instance.showPopUpOk('로그인', desc, ()=>{
                //     LoginSystemPopup.instance.closePopup();
                // });
            }
        });        
    }

    private onLoadInitialData( id: number ) {
        NetworkManager.Instance().reqLOAD_INITIAL_DATA(id, (res)=>{
            console.log( res );

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
        console.log('onClickJoin');

        this.main.onShowJoinMember();
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }
}
