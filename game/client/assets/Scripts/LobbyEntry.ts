import { _decorator, Component, Node } from 'cc';
import { LobbyAudioContoller } from './Lobby/LobbyAudioContoller';
import { LobbySystemPopup } from './LobbySystemPopup';
import { UiLobby } from './UiLobby';
import { ENUM_DEVICE_TYPE, GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('LobbyEntry')
export class LobbyEntry extends Component {
    @property(Node) rootPortrait: Node = null;
    @property(Node) rootLandscape: Node = null;
    @property(LobbyAudioContoller) AudioContoller: LobbyAudioContoller = null;

    private _lobby: UiLobby = null;
    private _popup: LobbySystemPopup = null;

    private _root: Node = null;
	private _isChildrenRegisted: boolean = false;    

    protected onLoad(): void {
        console.log('LobbyEntry onLoad');

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
        if ( this._lobby != null ) {
            this._lobby.init();
        }

        if ( this._popup != null ) {
            this._popup.initialize();
        }

        this.AudioContoller.init();
        this._lobby.show();
	}

	private RegisterChildren() {
		if ( this._root == null || this._isChildrenRegisted == true ) {
			return;
		}

        this._lobby = this._root.getChildByPath('LOBBY').getComponent(UiLobby);
        if ( this._lobby != null ) {
            this._lobby.node.active = false;
        }

        this._popup = this._root.getChildByPath('SYSTEM_POPUP').getComponent(LobbySystemPopup);
        if ( this._popup != null ) {
            this._popup.node.active = false;
        }

		this._isChildrenRegisted = true;
	}
}


