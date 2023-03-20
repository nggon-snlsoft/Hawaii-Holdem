import { _decorator, Component, Node, Button, EditBox, EventHandler, Label, AudioSource, AudioClip, director, Scene, game } from 'cc';
import { ENUM_RESULT_CODE, NetworkManager } from './NetworkManager';
import { Main } from './Main';
import { CommonUtil } from './CommonUtil';
import { LoginSystemPopup } from './Login/LoginSystemPopup';
const { ccclass, property } = _decorator;

@ccclass('UiLogin')
export class UiLogin extends Component {
    @property (Button) btnEnter: Button = null;
    @property (EditBox) editBoxUID: EditBox = null;
    @property (EditBox) editBoxPassword: EditBox = null;    
    @property (Label) labelLoginState: Label = null;
    @property (AudioSource) audioSource: AudioSource = null;
    @property (AudioClip) soundButtonClick: AudioClip = null;
    @property (Button) buttonExit: Button = null;    

    @property (Button) buttonJoin: Button = null;

    private main: Main = null;
    
    pinLength: number = 8;

    init(main: Main) {
        this.main = main;

        this.btnEnter?.node.on( "click", this.onClickEnter.bind( this ), this );
        this.buttonJoin?.node.on('click', this.onClickJoin.bind( this ), this );
        this.buttonExit.node.on('click', ()=>{
            console.log('EXIT');
            LoginSystemPopup.instance.showPopUpYesOrNo('종료', '게임을 종료하시겠습니까?', ()=>{
                director.end();

                game.end();
            }, ()=>{
                LoginSystemPopup.instance.closePopup();
            });


        }, this);
    }
    
    onLoad()
    {
        // //this.btnEnter.interactable = false;
        // this.editBoxPIN.maxLength = this.pinLength;

        // const editBoxReturn = new EventHandler();
		// editBoxReturn.target = this.node;
		// editBoxReturn.component = "UiLogin";
		// editBoxReturn.handler = "onEditBoxReturn";
		// editBoxReturn.customEventData = "???";
		// this.editBoxPIN?.editingReturn.push( editBoxReturn );

		// const editBoxChanged = new EventHandler();
		// editBoxChanged.target = this.node;
		// editBoxChanged.component = "UiLogin";
		// editBoxChanged.handler = "onEditBoxChanged";
		// editBoxChanged.customEventData = "???";
		// this.editBoxPIN?.textChanged.push( editBoxChanged );

		// const editBoxDidBegan = new EventHandler();
		// editBoxDidBegan.target = this.node;
		// editBoxDidBegan.component = "UiLogin";
		// editBoxDidBegan.handler = "onEditingDidBegan";
		// editBoxDidBegan.customEventData = "???";
		// this.editBoxPIN.editingDidBegan.push( editBoxDidBegan );

        // this.labelLoginState.string = "Enter";
    }

    start() {
        if (NetworkManager.Instance().isLogin() == true) {
            
        }

        let leaveReason: number = NetworkManager.Instance().leaveReason;
        NetworkManager.Instance().leaveReason = -1;

        if ( -1 == leaveReason ) {
            return;
        }        
    }

    onClickEnter() {
        this.audioSource.playOneShot(this.soundButtonClick, 1);

        let uid = this.editBoxUID.string;
        let pass = this.editBoxPassword.string;

		NetworkManager.Instance().loginHoldem( uid, pass ,(res)=>{
            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                let id: number = res.id;

                NetworkManager.Instance().loadInitialData(id, (res)=>{
                    console.log(res);
                    if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                        if ( res.user != null && res.setting != null && res.conf != null ) {
                            CommonUtil.setGameSetting(res.conf);
                            director.loadScene("LobbyScene", (error: null | Error, scene?: Scene)=>{
                                
                            }, ()=>{
                
                            });

                        } else {
                            LoginSystemPopup.instance.showPopUpOk('로그인', '게임 정보를 불러올 수 없습니다.', ()=>{
                                LoginSystemPopup.instance.closePopup();
                            });
                        }
                    } else {
                        LoginSystemPopup.instance.showPopUpOk('로그인', '게임 정보를 불러올 수 없습니다.', ()=>{
                            LoginSystemPopup.instance.closePopup();
                        });
                    }
                }, (err)=>{
                    LoginSystemPopup.instance.showPopUpOk('로그인', '게임 정보를 불러올 수 없습니다.', ()=>{
                        LoginSystemPopup.instance.closePopup();
                    });
                });
            }
            else{
                let desc: string = '';
                switch ( res.msg ) {
                    case 'INVALID_UID':
                        desc = '잘못된 아이디 입니다.';
                        break;
                    case 'NO_EXIST_UID':
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
                }

                LoginSystemPopup.instance.showPopUpOk('로그인', desc, ()=>{
                    LoginSystemPopup.instance.closePopup();
                });
            }

            
            // let info = NetworkManager.Instance().getUserInfo();
            // CommonUtil.setGameSetting(res.game);

            // NetworkManager.Instance().setting(info.uuid, ( setting )=>{
            //     this.labelLoginState.string = "Success";            
            //     director.loadScene("LobbyScene", (error: null | Error, scene?: Scene)=>{
                    
            //     }, ()=>{
    
            //     });
            // }, ()=>{

            // });            
        },
        ()=>{
            this.labelLoginState.string = "FAIL";
        });
		// this.btnEnter.interactable = false;
	}

    onClickJoin() {
        this.main.onShowJoin();
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }
}


