import { _decorator, Component, Node, Input, resources, SpriteFrame, Label, Canvas } from 'cc';
import { UiJoinPlayer } from './Lobby/UiJoinPlayer';
import { LoginSystemPopup } from './Login/LoginSystemPopup';
import { UiLogin } from './UiLogin';
import { UiTable } from './UiTable';
import { ENUM_DEVICE_TYPE, GameManager } from './GameManager';
import { NetworkManager } from './NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
	@property(Node) rootPortrait: Node = null;
	@property(Node) rootLandscape: Node = null;	

	@property version: string = '1';

	private _root: Node = null;

	private _login: UiLogin = null;
	private _join: UiJoinPlayer = null;
	private _loginPopup: LoginSystemPopup = null;
	private _lableVersion: Label = null;

	private _isChildrenRegisted: boolean = false;

	protected onLoad(): void {
		GameManager.Instance().Init();

		this.rootPortrait.active = false;
		this.rootLandscape.active = false;

		let Info: any = GameManager.Instance().GetInfo();
		switch ( Info.device ) {
			case ENUM_DEVICE_TYPE.MOBILE_PORTRAIT:
				this._root = this.rootPortrait;
			break;

			case ENUM_DEVICE_TYPE.PC_LANDSCAPE:
				this._root = this.rootLandscape;
			break;				
		}

		this.RegisterChildren();
		this.Init();

		this._root.active = true;
	}

	private Init() {
		if ( this._login != null ) {
			this._login.init( this );
		}

		if ( this._join != null ) {
			this._join.init( this );
		}

		if ( this._loginPopup != null ) {
			this._loginPopup.initialize();
		}

		if ( this._lableVersion != null ) {
			this._lableVersion.node.active = true;
		}

		NetworkManager.Instance().Init( this.version, (res: any)=>{
			this._login.show();			
		}, ( err: any)=>{
			console.log('mismatch version');
			this._loginPopup.showPopUpOk('버전', '버전이 맞지 않습니다.', ()=>{
				this._login.exitGame();
			});

		} );
	}

	public onShowJoinMember() {
		this._login.hide();
		this._join.show();
	}

	public onShowLogin() {
		this._join.hide();
		this._login.show();
	}

	private RegisterChildren() {
		if ( this._root == null || this._isChildrenRegisted == true ) {
			return;
		}

		this._login = this._root.getChildByPath('LOGIN').getComponent(UiLogin);
		if ( this._login != null ) {
			this._login.node.active = false;
		}

		this._join = this._root.getChildByPath('JOIN').getComponent(UiJoinPlayer);
		if ( this._join != null ) {
			this._join.node.active = false;
		}

		this._loginPopup = this._root.getChildByPath('SYSTEM_POPUP').getComponent(LoginSystemPopup);
		if ( this._loginPopup != null ) {
			this._loginPopup.node.active = false;
		}

		this._lableVersion = this._root.getChildByPath('LABEL_VERSION').getComponent(Label);
		if ( this._lableVersion != null ) {
			this._lableVersion.node.active = false;
		}

		this._isChildrenRegisted = true;
	}
}


