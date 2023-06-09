import { _decorator, Component, Node, Label, Button, instantiate, Sprite, Layout, ScrollView } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('NoticeElement')
export class NoticeElement {
    @property( Node ) rootNode: Node = null;
    @property( Label ) labelTitle: Label = null;
    @property( Label ) labelAuthor: Label = null;
    @property( Label ) labelDate: Label = null;
    @property( Button ) buttonNotice: Button = null;

    private notice: any = null;
    private cbSelect: ( info: any )=> void = null;

    public CopyObject(): NoticeElement {
        let o: NoticeElement = new NoticeElement();
        let n = instantiate( this.rootNode );

        o.rootNode = n;
        o.labelTitle = n.getChildByPath('VALUES/LABEL_TITLE').getComponent( Label );
        o.labelAuthor = n.getChildByPath('VALUES/LABEL_AUTHOR').getComponent( Label );
        o.labelDate = n.getChildByPath('VALUES/LABEL_DATE').getComponent( Label );

        o.buttonNotice = n.getComponent( Button );
        return o;
    }

    public Clear() {
        this.labelTitle.string = '';        
        this.labelDate.string = '';
        this.labelAuthor.string = '';
        this.buttonNotice.node.off( 'click' );
        this.cbSelect = null;
    }

    public Set( info: any, cb: ( info: any )=>void ) {
        this.notice = info;
        this.labelTitle.string = CommonUtil.TruncateString(info.title, 15) ;
        this.labelDate.string = info.createDate;
        this.labelAuthor.string = '운영자';

        if ( cb != null ) {
            this.cbSelect = cb;
        }

        this.buttonNotice.node.off( 'click' );
        this.buttonNotice.node.on( 'click', this.onSELECT_NOTICE.bind(this), this );
    }

    public SetActive( active: boolean ) {
        this.rootNode.active = active;
    }

    public SetParent( parent: Node ) {
        this.rootNode.parent = parent;
    }

    public onSELECT_NOTICE(button: Button ) {
        if ( this.cbSelect != null ) {
            this.cbSelect( this.notice );
        }
    }
}

@ccclass('UiLOBBY_POPUP_NOTICE')
export class UiLOBBY_POPUP_NOTICE extends Component {
    @property(Label) labelTitle: Label = null;

    @property(Node) rootList: Node = null;
    @property(Node) rootShow: Node = null;

    @property(Layout) layoutNotices: Layout = null;
    @property(ScrollView) svNotices: ScrollView = null;

    @property(NoticeElement) originNotice: NoticeElement = new NoticeElement();

    @property(Label) labelShowTitle: Label = null;
    @property(Label) labelShowDate: Label = null;
    @property(Label) labelShowDescription: Label = null;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonBack: Button = null;

    private selectdNotice: any = null;
    private NoticeElementOnList: NoticeElement[] = [];

    private cbEXIT: ()=>void = null;

    public Init( cbEXIT: any ) {
        if ( cbEXIT != null ) {
            this.cbEXIT = null;
            this.cbEXIT = cbEXIT;
        }

        this.node.active = false;
        this.labelTitle.string = '공 지';

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onCLICK_EXIT.bind(this), this );

        this.buttonBack.node.off( 'click' );
        this.buttonBack.node.on( 'click', this.onCLICK_BACK.bind(this), this );
    }

    public Show( button: Button ) {
        this.selectdNotice = null;
        this.rootList.active = false;
        this.rootShow.active = false;

        NetworkManager.Instance().reqNOTICES((res: any)=>{
            button.interactable = true;

            if ( res != null && res.notices != null ) {
                this.onSHOW_LIST( res.notices );
            }

            this.rootList.active = true;
            this.node.active = true;
        }, (err: any)=>{
            button.interactable = true;            
            if ( this.cbEXIT != null ) {
                this.cbEXIT();
            }

            this.node.active = true;
        });
    }

    private onSHOW_LIST( notices: any[] ) {
        if ( notices == null ) {
            return;
        }
        this.ClearList();

        let NoticesLength = Math.min( notices.length, 20 );
        for ( let i: number = 0 ; i < NoticesLength ; i++ ) {
            let o = this.originNotice.CopyObject();
            
            o.Clear();
            o.Set( notices[i], this.onSELECT_NOTICE.bind(this));
            o.SetParent( this.layoutNotices.node );
            o.SetActive( true );

            this.NoticeElementOnList.push(o);
        }
        this.svNotices.scrollToTop();
    }
    
    private onREFRESH() {
        this.selectdNotice = null;
        NetworkManager.Instance().reqNOTICES( (res: any)=>{
            if ( res != null && res.notices != null ) {
                this.onSHOW_LIST( res.notices );
            }
        }, ( err: any )=>{});
    }    

    private ClearList() {
        this.selectdNotice = null;        
        this.DestoryElements();
    }

    private DestoryElements() {
        this.NoticeElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;
        } );

        this.NoticeElementOnList = [];
    }    

    public Hide() {
        this.selectdNotice = null;
        this.DestoryElements();

        this.node.active = false;
    }

    private onCLICK_EXIT( button: Button ) {
        if ( this.cbEXIT != null ) {
            this.cbEXIT();
        }
    }

    private onCLICK_BACK( button: Button ) {
        this.rootShow.active = false;
        this.rootList.active = true;

        this.onREFRESH();
    }

    private onSELECT_NOTICE( info:any ) {
        if ( info != null ) {
            this.labelShowTitle.string = info.title;
            this.labelShowDate.string = info.createDate;
            this.labelShowDescription.string = info.description;

            this.rootShow.active = true;
        }
    }
}

