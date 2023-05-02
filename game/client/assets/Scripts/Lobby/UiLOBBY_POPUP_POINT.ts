import { _decorator, Button, Component, instantiate, Label, Layout, Node, ScrollView, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PointTransferElement')
export class PointTransferElement {
    @property( Node ) rootNode: Node = null;
    @property( Label ) labelDate: Label = null;
    @property( Label ) labelTransferPoint: Label = null;
    @property( Label ) labelRemainPoint: Label = null;
    @property( Label ) labelDescription: Label = null;

    public CopyObject(): PointTransferElement {
        let o: PointTransferElement = new PointTransferElement();
        let n = instantiate( this.rootNode );

        o.rootNode = n;
        o.labelDate = n.getChildByPath('VALUES/LABEL_DATE').getComponent( Label);
        o.labelTransferPoint = n.getChildByPath('VALUES/LABEL_TRANSFER_POINT').getComponent( Label);
        o.labelRemainPoint = n.getChildByPath('VALUES/LABEL_REMAIN_POINT').getComponent( Label);
        o.labelDescription = n.getChildByPath('VALUES/LABEL_DESCRIPTION').getComponent( Label);

        return o;
    }

    public Clear() {
        this.labelDate.string = '';
        this.labelTransferPoint.string = '';
        this.labelRemainPoint.string = '';
        this.labelDescription.string = '';
    }

    public Set( info: any ) {
        this.labelDate.string = '1';
        this.labelTransferPoint.string = '2';
        this.labelRemainPoint.string = '3';
        this.labelDescription.string = '4';
    }

    public SetActive( active: boolean ) {
        this.rootNode.active = active;
    }

    public SetParent( parent: Node ) {
        this.rootNode.parent = parent;
    }
}

@ccclass('UiLOBBY_POPUP_POINT')
export class UiLOBBY_POPUP_POINT extends Component {
    @property(Label) labelTitle: Label = null;

    @property(Node) rootPoint: Node = null;
    @property(Node) rootGift: Node = null;

    @property(Toggle) togglePoint: Toggle = null;
    @property(Toggle) toggleGift: Toggle = null;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;

    @property(ScrollView) svPointTransfer: ScrollView = null;    

    @property(Layout) layoutPointLogs: Layout = null;
    @property(Layout) layoutGiftLogs: Layout = null;

    @property(PointTransferElement) originPointTransfer: PointTransferElement = new PointTransferElement();

    private pointTransferElementOnList: PointTransferElement[] = [];

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
        this.ShowPointTransferList( null );
        this.svPointTransfer.scrollToTop();

        this.node.active = true;
    }

    private ClearPointTransferList() {
        this.pointTransferElementOnList.forEach( (e)=>{
            e.Clear();
            e.SetActive( false );
            e.SetParent( this.node );
        });
        this.pointTransferElementOnList.splice(0);
    }

    private ShowPointTransferList( logs: any[] ) {
        // if ( logs == null || logs.length <= 0 ) {
        //     return;
        // }

        this.ClearPointTransferList();
        this.pointTransferElementOnList = [];

        // logs.forEach( (e)=> {
        //     let o = this.originPointTransfer.CopyObject();
        //     o.Clear();
        //     o.Set( e );
        //     o.SetParent( this.layoutPointLogs.node );
        //     o.SetActive ( true );

        //     this.pointTransferElementOnList.push( o );
        // });

        for ( let i = 0 ; i < 10 ; i++ ){
            let o = this.originPointTransfer.CopyObject();
            o.Clear();
            o.Set( null );
            o.SetParent( this.layoutPointLogs.node );
            o.SetActive ( true );

            this.pointTransferElementOnList.push( o );
        }
    }

    public Hide() {
        this.pointTransferElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;            
        } );

        this.pointTransferElementOnList = [];


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

