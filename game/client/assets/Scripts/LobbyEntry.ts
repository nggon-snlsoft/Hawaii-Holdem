import { _decorator, Component, Node } from 'cc';
import { LobbyAudioContoller } from './Lobby/LobbyAudioContoller';
import { LobbySystemPopup } from './LobbySystemPopup';
import { UiLobby } from './UiLobby';
const { ccclass, property } = _decorator;

@ccclass('LobbyEntry')
export class LobbyEntry extends Component {
    @property (UiLobby) uiLobby: UiLobby = null;
    @property (LobbySystemPopup) lobbySystemPopup: LobbySystemPopup = null;
    @property (LobbyAudioContoller) LobbyAudioContoller: LobbyAudioContoller = null;    

    start() {
        this.uiLobby.init();
        this.lobbySystemPopup.initialize();
        this.LobbyAudioContoller.init();

        this.setupLobby();
    }

    private setupLobby()    {
        this.uiLobby.show();
    }
}


