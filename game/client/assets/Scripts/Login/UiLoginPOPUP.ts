import { _decorator, Component, Node } from 'cc';
import { UiLoginPOPUP_VERSION_MISMATCH } from './UiLoginPOPUP_VERSION_MISMATCH';
const { ccclass, property } = _decorator;

@ccclass('UiLoginPOPUP')
export class UiLoginPOPUP extends Component {
    @property(UiLoginPOPUP_VERSION_MISMATCH) uiLoginPopupVersionMismatch: UiLoginPOPUP_VERSION_MISMATCH = null;

    public Init() {
        this.uiLoginPopupVersionMismatch.Init();
        this.node.active = false;
    }

    public Show() {
        this.node.active = true;
    }

    public Hide() {
        this.CLOSE_VersionMismatch();
        this.node.active = false;
    }

    public OPEN_VersionMismatch( referal: string, cbExit:()=>void , cbDOWNLOAD: ( url: string )=>void ) {
        this.uiLoginPopupVersionMismatch.Show( referal, cbExit, cbDOWNLOAD );

        this.Show();
    }

    public CLOSE_VersionMismatch() {
        this.uiLoginPopupVersionMismatch.Hide();
    }
}


