import { _decorator, Button, Component, Node, Sprite, Label, instantiate, Layout, ScrollView } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('GameMessageElement')
export class GameMessageElement {
    @property( Node ) rootNode: Node = null;
    @property( Button ) buttonMessage: Button = null;
    @property( Sprite) spriteUnread: Sprite = null;    
    @property( Label ) labelTitle: Label = null;
    @property( Label ) labelSender: Label = null;
    @property( Label ) labelDate: Label = null;

    private message: any = null;
    private cbSelect: ( info: any )=> void = null;

    public CopyObject(): GameMessageElement {
        let o: GameMessageElement = new GameMessageElement();
        let n = instantiate( this.rootNode );

        o.rootNode = n;
        o.spriteUnread = n.getChildByPath('VALUES/TITLE/SPRITE_UNREAD').getComponent( Sprite );        
        o.labelTitle = n.getChildByPath('VALUES/TITLE/LABEL_TITLE').getComponent( Label );
        o.labelSender = n.getChildByPath('VALUES/LABEL_SENDER').getComponent( Label );        
        o.buttonMessage = n.getComponent( Button );
        o.labelDate = n.getChildByPath('VALUES/LABEL_DATE').getComponent( Label);

        return o;
    }

    public Clear() {
        this.labelTitle.string = '';        
        this.labelDate.string = '';
        this.spriteUnread.node.active = false;

        this.cbSelect = null;
    }

    public Set( message: any, cb: ( message: any )=>void ) {
        this.message = message;
        this.labelTitle.string = CommonUtil.TruncateString(message.title, 15) ;
        this.labelSender.string = '운영자';
        this.labelDate.string = message.createDate;

        if ( cb != null ) {
            this.cbSelect = cb;
        }

        if ( message.unread == 1 ) {
            this.spriteUnread.node.active = true; 
        } else {
            this.spriteUnread.node.active = false;             
        }

        this.buttonMessage.node.off( 'click' );
        this.buttonMessage.node.on( 'click', this.onSELECT_MESSAGE.bind(this), this );
    }

    public SetActive( active: boolean ) {
        this.rootNode.active = active;
    }

    public SetParent( parent: Node ) {
        this.rootNode.parent = parent;
    }

    public onSELECT_MESSAGE(button: Button ) {
        if ( this.cbSelect != null ) {
            this.cbSelect( this.message );
        }
    }
}

@ccclass('UiGamePOPUP_MESSAGES')

export class UiGamePOPUP_MESSAGES extends Component {
    @property(Label) labelTitle: Label = null;    
    @property(Button) buttonExit: Button = null;

    @property(Node) PANEL_MESSAGE_LIST: Node = null;
    @property(Node) PANEL_MESSAGE_SHOW: Node = null;

    @property(Layout) layoutMessageList: Layout = null;
    @property(ScrollView) svMessagess: ScrollView = null;
    @property(GameMessageElement) originMessage: GameMessageElement = new GameMessageElement();

    @property(Label) labelMessageTitle: Label = null;
    @property(Label) labelMessageSender: Label = null;
    @property(Label) labelMessageDescription: Label = null;
    @property(Label) labelMessageUpdate: Label = null;    

    @property(Button) buttonBack: Button = null;

    private MessageElementOnList: GameMessageElement[] = [];
    private selectedMessage: any = null;

    private cbUNREAD_COUNT:()=>void;

    public init( cbUNREAD_COUNT: ()=> void ) {
        if ( cbUNREAD_COUNT != null ) {
            this.cbUNREAD_COUNT = cbUNREAD_COUNT;
        }


        this.labelTitle.string = '메시지';
        this.PANEL_MESSAGE_LIST.active = false;
        this.PANEL_MESSAGE_SHOW.active = false;

        this.node.active = false;
        this.buttonExit.node.off('click');
        this.buttonExit.node.on('click', this.onClickExit.bind(this));

        this.buttonBack.node.off('click');
        this.buttonBack.node.on('click', this.onBACK_MESSAGE_LIST.bind(this));
    }

    public show() {
        this.originMessage.rootNode.active = false;
        
        this.PANEL_MESSAGE_LIST.active = false;
        this.PANEL_MESSAGE_SHOW.active = false;

        this.selectedMessage = null;

        this.onMESSAGE_REFRESH();
        
        this.node.active = true;
    }

    private onMESSAGE_REFRESH() {
        this.selectedMessage = null;
        NetworkManager.Instance().reqMESSAGE( (res: any)=>{
            if ( res != null ) {
                this.PANEL_MESSAGE_LIST.active = true;
                this.ShowMessageList( res.messages );
            }
        }, (err:any)=>{

        } );        
    }

    private ShowMessageList( messages: any[] ) {
        if ( messages == null ) {
            return;
        }

        this.ClearList();

        let MessagesLength = Math.min( messages.length, 20 );
        for ( let i: number = 0 ; i < MessagesLength ; i++ ) {
            let o = this.originMessage.CopyObject();
            
            o.Clear();
            o.Set( messages[i], this.onSELECT_MESSAGE.bind(this));
            o.SetParent( this.layoutMessageList.node );
            o.SetActive( true );

            this.MessageElementOnList.push(o);
        }
        this.svMessagess.scrollToTop();
    }
    private onSELECT_MESSAGE( message:any ) {
        this.ClearShowMessagePanel();
        this.selectedMessage = message;

        this.PANEL_MESSAGE_LIST.active = false;

        this.labelMessageTitle.string = this.selectedMessage.title;
        this.labelMessageSender.string = '보낸사람: 운영자';
        this.labelMessageDescription.string = this.selectedMessage.desc;
        this.labelMessageUpdate.string = this.selectedMessage.createDate;

        if ( this.selectedMessage.unread == 1 ) {
            NetworkManager.Instance().reqREAD_MESSAGE( this.selectedMessage.id, (res: any )=>{
                if ( this.cbUNREAD_COUNT != null ) {
                    this.cbUNREAD_COUNT();
                }

            }, ( err: any )=>{

            });
        }

        this.PANEL_MESSAGE_SHOW.active = true;
    }

    private ClearShowMessagePanel() {
        
        this.labelMessageTitle.string = '';
        this.labelMessageSender.string = '';
        this.labelMessageDescription.string = '';
        this.labelMessageUpdate.string = '';

        this.selectedMessage = null;
    }

    private ClearList() {
        this.selectedMessage = null;
        this.DestoryElements();
    }

    private DestoryElements() {
        this.MessageElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;
        });

        this.MessageElementOnList = [];
    }

    public hide() {
        this.selectedMessage = null;
        this.DestoryElements();

        this.node.active = false;
    }

    private onClickExit(button: Button) {
        this.hide();
    }

    private onBACK_MESSAGE_LIST( button: Button ) {
        this.PANEL_MESSAGE_SHOW.active = false;
        this.PANEL_MESSAGE_LIST.active = true;

        this.onMESSAGE_REFRESH();
    }
}


