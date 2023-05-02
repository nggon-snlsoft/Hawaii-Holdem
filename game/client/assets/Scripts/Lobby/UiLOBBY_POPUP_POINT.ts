import { _decorator, Button, Component, Label, Node, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_POINT')
export class UiLOBBY_POPUP_POINT extends Component {
    @property(Label) labelTitle: Label = null;

    @property(Node) rootPoint: Node = null;
    @property(Node) rootGift: Node = null;

    @property(Toggle) togglePoint: Toggle = null;
    @property(Toggle) toggleGift: Toggle = null;

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
        this.labelTitle.string = '포인트 전환';

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonApply.node.off( 'click' );
        this.buttonApply.node.on( 'click', this.onAPPLY.bind(this), this );

        this.togglePoint.node.on('toggle', this.onTOGGLE_POINT.bind(this), null);
        this.toggleGift.node.on('toggle', this.onTOGGLE_GIFT.bind(this), null);
    }

    public Show( button: Button ) {
        button.interactable = true;

        this.rootPoint.active = true;
        this.rootGift.active = false;

        this.togglePoint.isChecked = true;

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

    private onTOGGLE_POINT( toggle: Toggle ) {
        if ( toggle.isChecked == true ) {
            this.rootPoint.active = true;
            this.rootGift.active = false;
        }
    }

    private onTOGGLE_GIFT( toggle: Toggle ) {
        if ( toggle.isChecked == true ) {
            this.rootPoint.active = false;
            this.rootGift.active = true;
        }
    }
}

