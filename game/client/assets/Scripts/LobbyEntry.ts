import { _decorator, Component, Node, game, Game } from 'cc';
import { LobbyAudioContoller } from './Lobby/LobbyAudioContoller';
import { LobbySystemPopup } from './LobbySystemPopup';
import { UiLobby } from './UiLobby';
import { ENUM_CURRENT_SCENE, ENUM_DEVICE_TYPE, GameManager } from './GameManager';
import { NetworkManager } from './NetworkManager';
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
        this.AudioContoller.init();        
        if ( this._lobby != null ) {
            this._lobby.init();
        }

        if ( this._popup != null ) {
            this._popup.initialize();
        }

        this._lobby.show( ()=>{
            this.end();
        });

        GameManager.Instance().SetCurrentScene(ENUM_CURRENT_SCENE.LOBBY_SCENE);

        game.off( Game.EVENT_SHOW);
        game.off( Game.EVENT_HIDE);

        game.on( Game.EVENT_SHOW, this.onEVENT_SHOW.bind(this), this);
        game.on( Game.EVENT_HIDE, this.onEVENT_HIDE.bind(this), this);
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

    private onEVENT_SHOW() {
        this._lobby.onEVENT_SHOW();
    }

    private onEVENT_HIDE() {
        this._lobby.onEVENT_HIDE();
    }

    public end() {
        game.off( Game.EVENT_SHOW);
        game.off( Game.EVENT_HIDE);
    }
}


