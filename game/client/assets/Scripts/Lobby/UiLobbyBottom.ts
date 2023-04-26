import { _decorator, Component, Node, Button } from 'cc';
import { LobbyAudioContoller } from './LobbyAudioContoller';
const { ccclass, property } = _decorator;

@ccclass('UiLobbyBottom')
export class UiLobbyBottom extends Component {
    @property(Button) buttonPoint: Button = null;
    @property(Button) buttonRanking: Button = null;
    @property(Button) buttonCharge: Button = null;
    @property(Button) buttonTransfer: Button = null;    
    @property(Button) buttonQNA: Button = null;
    @property(Button) buttonNotice: Button = null;

    private cbPOINT: ( button:Button )=> void = null;
    private cbRANKING: ( button:Button )=> void = null;
    private cbCHARGE: ( button:Button )=> void = null;
    private cbTRANSFER: ( button:Button )=> void = null;
    private cbQNA: ( button:Button )=> void = null;
    private cbNOTICE: ( button:Button )=> void = null;

    public init( cbPOINT: any, cbRANKING: any, cbCHARGE: any, cbTRANSFER: any, cbQNA: any, cbNOTICE: any ) {
        if ( cbPOINT != null ) {
            this.cbPOINT = null;
            this.cbPOINT = cbPOINT;
        }

        if ( cbRANKING != null ) {
            this.cbRANKING = null;
            this.cbRANKING = cbRANKING;
        }

        if ( cbCHARGE != null ) {
            this.cbCHARGE = null;
            this.cbCHARGE = cbCHARGE;            
        }

        if ( cbTRANSFER != null ) {
            this.cbTRANSFER = null;
            this.cbTRANSFER = cbTRANSFER;
        }

        if ( cbQNA != null ) {
            this.cbQNA = null;
            this.cbQNA = cbQNA;
        }

        if ( cbNOTICE != null ) {
            this.cbNOTICE = null;
            this.cbNOTICE = cbNOTICE;
        }
        
        this.buttonPoint.node.off('click');
        this.buttonPoint.node.on('click', this.onCLICK_POINT.bind(this), null);

        this.buttonRanking.node.off('click');
        this.buttonRanking.node.on('click', this.onCLICK_RANKING.bind(this), null);

        this.buttonCharge.node.off('click');
        this.buttonCharge.node.on('click', this.onCLICK_CHARGE.bind(this), null);        

        this.buttonTransfer.node.off('click');
        this.buttonTransfer.node.on('click', this.onCLICK_TRANSFER.bind(this), null);

        this.buttonQNA.node.off('click');
        this.buttonQNA.node.on('click', this.onCLICK_QNA.bind(this), null);

        this.buttonNotice.node.off('click');
        this.buttonNotice.node.on('click', this.onCLICK_NOTICE.bind(this), null);

        this.node.active = false;
    }

    public show() {
        this.node.active = true;
    }

    private onCLICK_POINT( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.PlayButtonClick();
        }

        if ( this.cbPOINT != null ) {
            this.cbPOINT( button );
        }
    }

    private onCLICK_RANKING( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.PlayButtonClick();
        }

        if ( this.cbRANKING != null ) {
            this.cbRANKING( button );
        }
    }

    private onCLICK_CHARGE( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.PlayButtonClick();
        }

        if ( this.cbCHARGE != null ) {
            this.cbCHARGE( button );
        }
    }

    private onCLICK_TRANSFER( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.PlayButtonClick();
        }

        if ( this.cbTRANSFER != null ) {
            this.cbTRANSFER( button );
        }
    }

    private onCLICK_QNA( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.PlayButtonClick();
        }

        if ( this.cbQNA != null ) {
            this.cbQNA( button );
        }
    }

    private onCLICK_NOTICE( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.PlayButtonClick();
        }

        if ( this.cbNOTICE != null ) {
            this.cbNOTICE( button );
        }
    }
}


