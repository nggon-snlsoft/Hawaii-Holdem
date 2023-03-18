import { _decorator, Component, Node, Button, EditBox, EventHandler, Label, AudioSource, AudioClip, director, Scene, game } from 'cc';
import { NetworkManager } from './NetworkManager';
import { Main } from './Main';
import { CommonUtil } from './CommonUtil';
import { LoginSystemPopup } from './Login/LoginSystemPopup';
const { ccclass, property } = _decorator;

@ccclass('UiLogin')
export class UiLogin extends Component {
    @property (Button) btnEnter: Button = null;
    @property (EditBox) editBoxPIN: EditBox = null;
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
        //this.btnEnter.interactable = false;
        this.editBoxPIN.maxLength = this.pinLength;

        const editBoxReturn = new EventHandler();
		editBoxReturn.target = this.node;
		editBoxReturn.component = "UiLogin";
		editBoxReturn.handler = "onEditBoxReturn";
		editBoxReturn.customEventData = "???";
		this.editBoxPIN?.editingReturn.push( editBoxReturn );

		const editBoxChanged = new EventHandler();
		editBoxChanged.target = this.node;
		editBoxChanged.component = "UiLogin";
		editBoxChanged.handler = "onEditBoxChanged";
		editBoxChanged.customEventData = "???";
		this.editBoxPIN?.textChanged.push( editBoxChanged );

		const editBoxDidBegan = new EventHandler();
		editBoxDidBegan.target = this.node;
		editBoxDidBegan.component = "UiLogin";
		editBoxDidBegan.handler = "onEditingDidBegan";
		editBoxDidBegan.customEventData = "???";
		this.editBoxPIN.editingDidBegan.push( editBoxDidBegan );


        this.labelLoginState.string = "Enter";
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
		this.labelLoginState.string = "Entering..";
        this.audioSource.playOneShot(this.soundButtonClick, 1);

		NetworkManager.Instance().login( /* "11111111"*/ this.editBoxPIN.string,(res)=>{
            
            let info = NetworkManager.Instance().getUserInfo();
            CommonUtil.setGameSetting(res.game);

            NetworkManager.Instance().setting(info.uuid, ( setting )=>{
                this.labelLoginState.string = "Success";            
                director.loadScene("LobbyScene", (error: null | Error, scene?: Scene)=>{
                    
                }, ()=>{
    
                });
            }, ()=>{

            });            
        },
        ()=>{
            this.labelLoginState.string = "FAIL";
        });
		this.btnEnter.interactable = false;
	}

    onClickJoin() {
        this.main.onShowJoin();
    }

    onEditBoxReturn() {
		if( this.pinLength != this.editBoxPIN.string.length ) {

			return;
		}

		this.onClickEnter();
	}

    onEditBoxChanged() {
		this.btnEnter.interactable = ( this.editBoxPIN.string.length == this.pinLength );
	}

    onEditingDidBegan() {
		this.editBoxPIN.string = "";
		this.labelLoginState.string = "Enter";
	}

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }
}


