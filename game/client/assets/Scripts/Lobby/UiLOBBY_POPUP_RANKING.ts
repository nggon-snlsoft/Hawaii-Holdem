import { _decorator, Component, Label, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_RANKING')
export class UiLOBBY_POPUP_RANKING extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;

    private cbEXIT: ()=>void = null;
    private cbAPPLY: ()=>void = null;    

    public Init( cbEXIT: any, cbAPPLY: any ) {
        if ( cbEXIT != null ) {
            this.cbEXIT = null;
            this.cbEXIT = cbEXIT;
        }

        if ( cbAPPLY != null ) {
            this.cbAPPLY = null;
            this.cbAPPLY = cbAPPLY;
        }

        this.node.active = false;
        this.labelTitle.string = '랭 킹';

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonApply.node.off( 'click' );
        this.buttonApply.node.on( 'click', this.onAPPLY.bind(this), this );
    }

    public Show( button: Button ) {
        button.interactable = true;        
        this.node.active = true;
    }

    public Hide() {
        this.node.active = false;
    }

    private onEXIT( button: Button ) {
        if ( this.cbEXIT != null ) {
            this.cbEXIT();
        }
    }

    private onAPPLY( button: Button ) {
        if ( this.cbAPPLY != null ) {
            this.cbAPPLY();
        }
    }
}

