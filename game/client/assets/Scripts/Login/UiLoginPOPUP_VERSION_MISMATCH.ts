import { _decorator, Button, Component, Node } from 'cc';
import { NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('UiLoginPOPUP_VERSION_MISMATCH')
export class UiLoginPOPUP_VERSION_MISMATCH extends Component {
    @property(Button) buttonExit: Button = null;
    @property(Button) buttonDownload: Button = null;

    private url: string = '';

    private cbEXIT:()=>void = null;
    private cbDOWNLOAD: ( referal: string )=>void = null;

    public Init() {
        this.buttonExit.node.off('click');
        this.buttonExit.node.on('click', this.onCLICK_EXIT.bind(this));

        this.buttonDownload.node.off('click');
        this.buttonDownload.node.on('click', this.onCLICK_DOWNLOAD.bind(this));

        this.node.active = false;
    }

    public Show( referal: string, cbEXIT:()=>void, cbDOWNLOAD:( referal: string )=>void ) {
        if ( cbEXIT != null ) {
            this.cbEXIT = cbEXIT;
        }

        if ( cbDOWNLOAD != null ) {
            this.cbDOWNLOAD = cbDOWNLOAD;
        }

        NetworkManager.Instance().reqCOMPANY( (res: any)=>{
            if ( res != null && res.store != null && res.store.homepage != null ) {
                this.url = res.store.homepage + '?code=' + referal;
            }

            this.node.active = true;
        }, (err: any)=>{
            this.node.active = true;
        });
    }

    private onCLICK_EXIT() {
        if ( this.cbEXIT != null ) {
            this.cbEXIT();
        }
    }

    private onCLICK_DOWNLOAD() {
        if ( this.cbDOWNLOAD != null ) {
            this.cbDOWNLOAD( this.url );
        }
    }

    public Hide() {
        if ( this.cbEXIT != null ) {
            this.cbEXIT = null;
        }

        if ( this.cbDOWNLOAD != null ) {
            this.cbDOWNLOAD = null;
        }

        this.node.active = false;
    }
}


