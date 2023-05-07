import { _decorator, Button, CapsuleColliderComponent, Component, EditBox, instantiate, Label, Layout, log, Node, ScrollView, Toggle } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { CommonUtil } from '../CommonUtil';
import { LobbySystemPopup } from '../LobbySystemPopup';
const { ccclass, property } = _decorator;

@ccclass('PointTransferElement')
export class PointTransferElement {
    @property( Node ) rootNode: Node = null;
    @property( Label ) labelDate: Label = null;
    @property( Label ) labelTransferPoint: Label = null;
    @property( Label ) labelRemainPoint: Label = null;
    @property( Label ) labelAddBalance: Label = null;    
    @property( Label ) labelDescription: Label = null;

    public CopyObject(): PointTransferElement {
        let o: PointTransferElement = new PointTransferElement();
        let n = instantiate( this.rootNode );

        o.rootNode = n;
        o.labelDate = n.getChildByPath('VALUES/LABEL_DATE').getComponent( Label);
        o.labelTransferPoint = n.getChildByPath('VALUES/LABEL_TRANSFER_POINT').getComponent( Label);
        o.labelRemainPoint = n.getChildByPath('VALUES/LABEL_REMAIN_POINT').getComponent( Label);
        o.labelAddBalance = n.getChildByPath('VALUES/LABEL_ADD_BALANCE').getComponent( Label );
        o.labelDescription = n.getChildByPath('VALUES/LABEL_DESCRIPTION').getComponent( Label);

        return o;
    }

    public Clear() {
        this.labelDate.string = '';
        this.labelTransferPoint.string = '';
        this.labelRemainPoint.string = '';
        this.labelDescription.string = '';
        this.labelAddBalance.string = '';
    }

    public Set( info: any ) {
        this.labelDate.string = info.createDate;
        this.labelTransferPoint.string = CommonUtil.getKoreanNumber(info.point);
        this.labelRemainPoint.string = CommonUtil.getKoreanNumber(info.newPoint);
        this.labelAddBalance.string = CommonUtil.getKoreanNumber(info.newBalance - info.oldBalance);
        if ( info.desc != null ) {
            this.labelDescription.string = info.desc;
        } else {
            this.labelDescription.string = '';            
        }
    }

    public SetActive( active: boolean ) {
        this.rootNode.active = active;
    }

    public SetParent( parent: Node ) {
        this.rootNode.parent = parent;
    }
}

@ccclass('PointGiftElement')
export class PointGiftElement {
    @property( Node ) rootNode: Node = null;
    @property( Label ) labelDate: Label = null;
    @property( Label ) labelSender: Label = null;    
    @property( Label ) labelReceivePoint: Label = null;
    @property( Label ) labelPoint: Label = null;
    @property( Label ) labelDescription: Label = null;

    public CopyObject(): PointGiftElement {
        let o: PointGiftElement = new PointGiftElement();
        let n = instantiate( this.rootNode );

        o.rootNode = n;
        o.labelDate = n.getChildByPath('VALUES/LABEL_DATE').getComponent( Label);
        o.labelSender = n.getChildByPath('VALUES/LABEL_SENDER').getComponent( Label);
        o.labelReceivePoint = n.getChildByPath('VALUES/LABEL_RECEIVE_POINT').getComponent( Label);
        o.labelPoint = n.getChildByPath('VALUES/LABEL_POINT').getComponent( Label);
        o.labelDescription = n.getChildByPath('VALUES/LABEL_DESCRIPTION').getComponent( Label);

        return o;
    }

    public Clear() {
        this.labelDate.string = '';
        this.labelSender.string = '';
        this.labelReceivePoint.string = '';
        this.labelPoint.string = '';
        this.labelDescription.string = '';
    }

    public Set( info: any ) {
        this.labelDate.string = info.createDate;
        this.labelReceivePoint.string = CommonUtil.getKoreanNumber(info.point);
        this.labelPoint.string = CommonUtil.getKoreanNumber(info.newPoint);
        this.labelSender.string = info.sender;

        if ( info.desc != null ) {
            this.labelDescription.string = info.desc;
        } else {
            this.labelDescription.string = '';            
        }
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
    @property(Button) buttonConfirm: Button = null;    

    @property(ScrollView) svPointTransfer: ScrollView = null;    
    @property(ScrollView) svPointGift: ScrollView = null;        

    @property(Layout) layoutPointLogs: Layout = null;
    @property(Layout) layoutGiftLogs: Layout = null;

    @property(Label) labelUserBalance: Label = null;
    @property(Label) labelUserPoint: Label = null;
    @property(EditBox) editboxPointTransfer: EditBox = null;

    @property(PointTransferElement) originPointTransfer: PointTransferElement = new PointTransferElement();
    @property(PointGiftElement) originPointGift: PointGiftElement = new PointGiftElement();    

    private pointTransferElementOnList: PointTransferElement[] = [];
    private pointGiftElementOnList: PointGiftElement[] = [];

    private user: any = null;

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

        this.labelUserBalance.string = '';
        this.labelUserPoint.string = '';

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonApply.node.off( 'click' );
        this.buttonApply.node.on( 'click', this.onAPPLY.bind(this), this );

        this.buttonConfirm.node.off( 'click' );
        this.buttonConfirm.node.on( 'click', this.onEXIT.bind(this), this );        

        this.togglePoint.node.on('toggle', this.onTOGGLE_POINT.bind(this), null);
        this.toggleGift.node.on('toggle', this.onTOGGLE_GIFT.bind(this), null);

        this.originPointTransfer.rootNode.active = false;
        this.originPointGift.rootNode.active = false;

        this.editboxPointTransfer.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editboxPointTransfer.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editboxPointTransfer.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editboxPointTransfer.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);
    }

    public Show( button: Button ) {
        this.originPointTransfer.rootNode.active = false;
        this.originPointGift.rootNode.active = false;

        NetworkManager.Instance().getUSER_FromDB( (res: any)=>{
            button.interactable = true;
            this.user = res.user;

            this.SetUserInfo();
            NetworkManager.Instance().getPOINT_TRANSFERS( (res)=>{

                if ( res != null ) {
                    this.ShowPointTransferList( res.logs)
                }

                this.rootPoint.active = true;
                this.rootGift.active = false;
                this.togglePoint.isChecked = true;
                this.node.active = true;

                this.buttonApply.node.active = true;
                this.buttonConfirm.node.active = false;


            }, (err)=>{
                this.rootPoint.active = true;
                this.rootGift.active = false;
                this.buttonConfirm.node.active = false;                
                this.togglePoint.isChecked = true;
                this.node.active = true;
            });
        }, ( err: any )=>{
            button.interactable = true;
        })
    }

    private SetUserInfo () {
        this.labelUserBalance.string = CommonUtil.getKoreanNumber(this.user.balance);
        this.labelUserPoint.string = CommonUtil.getKoreanNumber(this.user.point);
    }

    private ClearPointTransferList() {
        this.DestroyPointTransferElements();
    }

    private ClearPointGiftList() {
        this.DestroyPointGiftElements();
    }

    private ShowPointTransferList( logs: any[] ) {
        if ( logs == null || logs.length <= 0 ) {
            return;
        }

        this.ClearPointTransferList();

        let logLength = Math.min( logs.length, 20 );
        for ( let i: number = 0 ; i < logLength ; i++ ) {
            let o = this.originPointTransfer.CopyObject();
            o.Clear();
            o.Set( logs[i] );
            o.SetParent( this.layoutPointLogs.node );
            o.SetActive ( true );

            this.pointTransferElementOnList.push( o );
        }

        this.svPointTransfer.scrollToTop();
    }

    private ShowPointGiftList( logs: any[] ) {
        if ( logs == null || logs.length <= 0 ) {
            return;
        }

        this.ClearPointGiftList();

        let logLength = Math.min( logs.length, 20 );
        for ( let i: number = 0 ; i < logLength ; i++ ) {
            let o = this.originPointGift.CopyObject();
            o.Clear();
            o.Set( logs[i] );
            o.SetParent( this.layoutGiftLogs.node );
            o.SetActive ( true );

            this.pointGiftElementOnList.push( o );
        }

        this.svPointGift.scrollToTop();
    }

    private DestroyPointTransferElements() {
        this.pointTransferElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;            
        } );
        
        this.pointTransferElementOnList = [];        
    }

    private DestroyPointGiftElements() {
        this.pointGiftElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;            
        } );
        
        this.pointGiftElementOnList = [];
    }    

    public Hide() {
        this.DestroyPointTransferElements();
        this.DestroyPointGiftElements();

        this.node.active = false;
    }

    private onEXIT( button: Button ) {
        if ( this.cbEXIT != null ) {
            this.cbEXIT();
        }
    }

    private onAPPLY( button: Button ) {
        button.interactable = false;
        let point = this.user.point;
        let value = Number(this.editboxPointTransfer.string);

        if ( this.editboxPointTransfer.string.length == 0 || value <= 0 ) {
            LobbySystemPopup.instance.showPopUpOk('포인트전환', '전환할 포인트를 입력해주세요', ()=>{
                button.interactable = true;            
            });
            return;
        }

        if ( value > point ) {
            LobbySystemPopup.instance.showPopUpOk('포인트전환', '포인트가 부족합니다.', ()=>{
                button.interactable = true;            
            });
            return;            
        }

        let oldBalance = this.user.balance;
        let oldPoint = this.user.point;
        LobbySystemPopup.instance.showPopUpYesOrNo('포인트전환', CommonUtil.getKoreanNumber(value) + ' 포인트를 게임머니로 전환하시겠습니까?', ()=>{
            this.PointTransfer(value, oldBalance, oldPoint, ( logs )=>{
                button.interactable = true;
                if ( logs != null && logs.length > 0 ) {
                    this.ShowPointTransferList( logs );
                }

                if ( this.cbAPPLY != null ) {
                    this.cbAPPLY();
                }
            });
        }, ()=>{
            button.interactable = true;
        });
    }

    private PointTransfer(value: number,  oldBalance: number, oldPoint: number, done: (logs)=>void ) {
        let user_id = this.user.id;
        NetworkManager.Instance().reqPOINT_TRANSFER( {
            user_id: user_id,
            value: value
        }, (res: any)=>{
            this.user = NetworkManager.Instance().GetUser();

            let newBalance = this.user.balance;
            let newPoint = this.user.point;
            let b: string = '게임머니: ' + CommonUtil.getKoreanNumber(oldBalance) + ' -> ' + CommonUtil.getKoreanNumber(newBalance);
            let p: string = '포인트: ' + CommonUtil.getKoreanNumber(oldPoint) + ' -> ' + CommonUtil.getKoreanNumber(newPoint);            

            LobbySystemPopup.instance.showPopUpOk('포인트 변환', '포인트가 변환되었습니다.\n' + b + '\n' + p, ()=>{

                this.labelUserBalance.string = CommonUtil.getKoreanNumber(this.user.balance);
                this.labelUserPoint.string = CommonUtil.getKoreanNumber(this.user.point);    
                this.editboxPointTransfer.string = '';

                done( res.logs );
    
            });
        }, (err: any)=>{
            if ( done != null ) {
                done(null);
            }
        } );
    }

    private ShowGiftLog() {
        NetworkManager.Instance().getPOINT_RECEIVES( (res)=>{
            this.ShowPointGiftList( res.logs );
        }, (err)=>{

        });
    }

    private onTOGGLE_POINT( toggle: Toggle ) {
        if ( toggle.isChecked == true ) {
            this.rootPoint.active = true;
            this.rootGift.active = false;

            this.buttonApply.node.active = true;
            this.buttonConfirm.node.active = false;
        }
    }

    private onTOGGLE_GIFT( toggle: Toggle ) {
        if ( toggle.isChecked == true ) {

            this.ShowGiftLog();

            this.rootPoint.active = false;
            this.rootGift.active = true;

            this.buttonApply.node.active = false;
            this.buttonConfirm.node.active = true;
        }
    }

    private onEDITBOX_DID_BEGAN( editbox ) {
        editbox.string = '';
    }    

    private onEDITBOX_RETURN( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
    }

    private onEDITBOX_DID_ENDED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
    }

    private onEDITBOX_TEXT_CHANGED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
    }

}

