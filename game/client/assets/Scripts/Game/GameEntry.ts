import { _decorator, Component, Node } from 'cc';
import {UiGameSystemPopup} from "./UiGameSystemPopup";
import {UiGameInput} from "./UiGameInput";
import { UiControls } from './UiControls';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('GameEntry')
export class GameEntry extends Component {
    @property(AudioController) audioController: AudioController = null;

    @property(Node) nodeUiSeat: Node = null;
    @property(Node) nodeUiTable: Node = null;

    @property(UiGameSystemPopup) uiGameSystemPopup: UiGameSystemPopup = null;
    @property(UiGameInput) uiGameInput: UiGameInput = null;
    @property(UiControls) uiControls: UiControls = null;

    onLoad() {
        this.nodeUiTable.active = true;
        this.nodeUiSeat.active = false;

        this.audioController.init();
        
        this.uiGameSystemPopup.init();
        this.uiGameInput.init();
        this.uiControls.init();
    }
}


