import { _decorator, Component, Node, Button } from 'cc';
import { LobbyAudioContoller } from './LobbyAudioContoller';
const { ccclass, property } = _decorator;

@ccclass('UiLobbyBottom')
export class UiLobbyBottom extends Component {
    @property(Button) buttonQuickJoin: Button = null;
    @property(Button) buttonPoint: Button = null;    
    @property(Button) buttonRanking: Button = null;
    @property(Button) buttonCharge: Button = null;
    @property(Button) buttonTransfer: Button = null;

    private cbQuickJoin: (button: Button)=>void = null;
    private cbPoint: (button: Button)=>void = null;    
    private cbRanking: (button: Button)=>void = null;
    private cbCharge: (button: Button)=>void = null;
    private cbTransfer: (button: Button)=>void = null;

    public init( cbQuickJoin:( button:Button )=>void,
                 cbPoint:( button:Button )=>void, 
                 cbRanking: ( button:Button )=>void, 
                 cbCharge: (button: Button )=>void,
                 cbTransfer: (button: Button )=>void ) {
        
        this.cbQuickJoin = cbQuickJoin;
        this.cbPoint = cbPoint;        
        this.cbRanking = cbRanking;
        this.cbCharge = cbCharge;
        this.cbTransfer = cbTransfer;

        this.buttonQuickJoin.node.on("click", this.onClickQuickJoin.bind(this), this);
        this.buttonPoint.node.on("click", this.onClickPoint.bind(this), this);        
        this.buttonRanking.node.on("click", this.onClickRanking.bind(this), this);
        this.buttonCharge.node.on("click", this.onClickCharge.bind(this), this);
        this.buttonTransfer.node.on("click", this.onClickTransfer.bind(this), this);

        this.node.active = false;
    }

    public show() {
        this.node.active = true;
    }

    test() {
        this.node.active = true;        
    }

    private onClickQuickJoin( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.playButtonClick();

            this.cbQuickJoin( button );
        }
    }

    private onClickPoint(button: Button) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.playButtonClick();

            this.cbPoint( button );
        }
    }

    private onClickRanking( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.playButtonClick();

            this.cbRanking( button );
        }
    }

    private onClickCharge( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.playButtonClick();

            this.cbCharge( button );
        }
    }

    private onClickTransfer( button: Button ) {
        if ( button != null ) {
            button.interactable = false;
            LobbyAudioContoller.instance.playButtonClick();

            this.cbTransfer( button );
        }
    }
}


