import { _decorator, Component, Node, Label, Button, instantiate, Sprite, Layout, ScrollView, EditBox } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { CommonUtil } from '../CommonUtil';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('QnAElement')
export class QnAElement {
    @property( Node ) rootNode: Node = null;
    @property( Sprite ) spriteSlot: Sprite = null;
    @property( Label ) labelTitle: Label = null;
    @property( Button ) buttonQNA: Button = null;    

    @property( Label ) labelButton: Label = null;
    @property( Label ) labelDate: Label = null;

    private qna: any = null;
    private cbSelect: ( info: any )=> void = null;

    public CopyObject(): QnAElement {
        let o: QnAElement = new QnAElement();
        let n = instantiate( this.rootNode );

        o.rootNode = n;
        o.spriteSlot = n.getChildByPath('SPRITE_SLOT').getComponent( Sprite );
        o.labelTitle = n.getChildByPath('VALUES/LABEL_TITLE').getComponent( Label );
        o.buttonQNA = n.getChildByPath('BUTTON_SHOW').getComponent( Button );
        o.labelButton = n.getChildByPath('BUTTON_SHOW/LABEL_BUTTON').getComponent( Label );                
        o.labelDate = n.getChildByPath('VALUES/LABEL_DATE').getComponent( Label);

        return o;
    }

    public Clear() {
        this.labelTitle.string = '';        
        this.labelDate.string = '';

        this.cbSelect = null;
    }

    public Set( info: any, cb: ( info: any )=>void ) {
        this.qna = info;
        this.labelTitle.string = CommonUtil.TruncateString(info.title, 15) ;
        this.labelDate.string = info.questionDate;

        if ( cb != null ) {
            this.cbSelect = cb;
        }

        this.buttonQNA.node.off( 'click' );
        this.buttonQNA.node.on( 'click', this.onSELECT_QNA.bind(this), this );
    }

    public SetActive( active: boolean ) {
        this.rootNode.active = active;
    }

    public SetParent( parent: Node ) {
        this.rootNode.parent = parent;
    }

    public onSELECT_QNA(button: Button ) {
        if ( this.cbSelect != null ) {
            this.cbSelect( this.qna );
        }
    }
}



@ccclass('UiLOBBY_POPUP_QnA')
export class UiLOBBY_POPUP_QnA extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Node) rootPANEL_LIST: Node = null;
    @property(Node) rootPANEL_INPUT: Node = null;
    @property(Node) rootPANEL_SHOW: Node = null;    

    @property(Layout) layoutQnAList: Layout = null;
    @property(ScrollView) svQnAs: ScrollView = null;

    @property(QnAElement) originQNA: QnAElement = new QnAElement();

    @property(EditBox) editboxTitle: EditBox = null;

    @property(Button) buttonActivateTitle: Button = null;
    @property(Label) labelTitleText: Label = null;

    @property(Button) buttonExit: Button = null;

    @property(Button) buttonSend: Button = null;
    @property(Button) buttonCancel: Button = null;    
    @property(Button) buttonWrite: Button = null;
    @property(Button) buttonBack: Button = null;

    @property(Label) labelShowTitleText: Label = null;
    @property(Label) labelShowQuestionText: Label = null;
    @property(Label) labelShowAnswerText: Label = null;
    @property(Label) labelShowPending: Label = null;
    @property(Label) labelShowUpdate: Label = null;

    private QNAAElementOnList: QnAElement[] = [];

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
        this.labelTitle.string = '문 의';
        this.labelTitleText.string = '';

        this.rootPANEL_LIST.active = true;
        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_SHOW.active = false;

        this.labelShowTitleText.string = '';
        this.labelShowQuestionText.string = '';
        this.labelShowAnswerText.string = '';
        this.labelShowPending.string = '';
        this.labelShowUpdate.string = '';

        this.labelShowAnswerText.node.active = false;

        this.editboxTitle.node.on('editing-did-began', this.onTITLE_EDITBOX_DID_BEGAN.bind(this), this);
        this.editboxTitle.node.on('editing-return', this.onTITLE_EDITBOX_RETURN.bind(this), this);
        this.editboxTitle.node.on('text-changed', this.onTITLE_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editboxTitle.node.on('editing-did-ended', this.onTITLE_EDITBOX_DID_ENDED.bind(this), this);

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonWrite.node.off( 'click' );
        this.buttonWrite.node.on( 'click', this.onWRITE.bind(this), this );

        this.buttonActivateTitle.node.off( 'click' );
        this.buttonActivateTitle.node.on( 'click', this.onACTIVATE_TITLE.bind(this), this );

        this.buttonBack.node.off( 'click' );
        this.buttonBack.node.on( 'click', this.onBACK_LIST.bind(this), this );

        this.buttonSend.node.off( 'click' );
        this.buttonSend.node.on( 'click', this.onSEND_QNA.bind(this), this );

        this.buttonCancel.node.off( 'click' );
        this.buttonCancel.node.on( 'click', this.onSEND_CANCEL.bind(this), this );
    }

    public Show( button: Button ) {
        this.originQNA.rootNode.active = false;

        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_SHOW.active = false;

        NetworkManager.Instance().reqGET_QNA( (res: any)=>{
            button.interactable = true;

            if ( res != null ) {
                this.ShowList( res.qnas );
            }

            this.rootPANEL_LIST.active = true;
            this.node.active = true;

        }, (err:any)=>{
            this.rootPANEL_LIST.active = true;            
            button.interactable = true;
            this.node.active = true;
        } );
    }

    private onREFRESH() {
        NetworkManager.Instance().reqGET_QNA( (res: any)=>{
            if ( res != null ) {
                this.ShowList( res.qnas );
            }
        }, (err:any)=>{

        } );        
    }

    private ShowList( qnas: any[] ) {
        if ( qnas == null || qnas.length <= 0 ) {
            return;
        }
        this.ClearList();

        let QnAsLength = Math.min( qnas.length, 20 );
        for ( let i: number = 0 ; i < QnAsLength ; i++ ) {
            let o = this.originQNA.CopyObject();
            
            o.Clear();
            o.Set( qnas[i], this.onSELECT_QNA.bind(this));
            o.SetParent( this.layoutQnAList.node );
            o.SetActive( true );

            this.QNAAElementOnList.push(o);
        }
        this.svQnAs.scrollToTop();
    }

    private onSELECT_QNA( info:any ) {
        this.ClearShowPanel();

        this.rootPANEL_LIST.active = false;
        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_SHOW.active = true;

        this.labelShowTitleText.string = info.title;
        this.labelShowQuestionText.string = info.question;

        if ( info.pending == 1 ) {
            this.labelShowAnswerText.node.active = false;

            this.labelShowPending.string = '답변 대기중...'
            this.labelShowPending.node.active = true;
            this.labelShowUpdate.string = info.questionDate;

        } else {
            if ( info.answer != null ) {
                console.log('info.answer != null: ' + info.answer );
                this.labelShowAnswerText.string = info.answer;
                this.labelShowAnswerText.node.active = true;
            } else {
                this.labelShowAnswerText.string = '';
                this.labelShowAnswerText.node.active = true;                
            }

            this.labelShowUpdate.string = info.answerDate;
        }
    }

    private ClearShowPanel() {
        this.labelShowTitleText.string = '';
        this.labelShowQuestionText.string = '';
        this.labelShowAnswerText.string = '';
        this.labelShowPending.string = '답변 대기중...'
        this.labelShowPending.node.active = false;
        this.labelShowUpdate.string = '';
    }

    private ClearList() {
        this.DestoryElements();
    }

    private DestoryElements() {
        this.QNAAElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;
        } );

        this.QNAAElementOnList = [];
    }

    public Hide() {
        this.DestoryElements();
        this.node.active = false;
    }

    private onEXIT( button: Button ) {
        if ( this.cbEXIT != null ) {
            this.cbEXIT();
        }
    }

    private onWRITE( button: Button ) {
        this.rootPANEL_LIST.active = false;
        this.rootPANEL_INPUT.active = true;
    }    

    private onACTIVATE_TITLE( button: Button ) {
        this.editboxTitle.focus();
    }
    
    private onBACK_LIST( button: Button ) {
        this.rootPANEL_SHOW.active = false;
        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_LIST.active = true;

        this.onREFRESH();
    }
    
    private onSEND_QNA( button: Button ) {
        // this.rootPANEL_SHOW.active = false;
        // this.rootPANEL_INPUT.active = false;
        // this.rootPANEL_LIST.active = true;

        // this.onREFRESH();
    }
    
    private onSEND_CANCEL( button: Button ) {
        this.rootPANEL_SHOW.active = false;
        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_LIST.active = true;

        this.onREFRESH();
    }

    private onAPPLY( button: Button ) {
        if ( this.cbAPPLY != null ) {
            this.cbAPPLY();
        }
    }

    private onTITLE_EDITBOX_DID_BEGAN( editbox ) {
        editbox.string = '';
        console.log('onEDITBOX_DID_BEGAN');
    }    

    private onTITLE_EDITBOX_RETURN( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
        editbox.string = editbox.string.toLowerCase();
    }

    private onTITLE_EDITBOX_DID_ENDED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
        editbox.string = editbox.string.toLowerCase();        
    }

    private onTITLE_EDITBOX_TEXT_CHANGED( editbox ) {
        console.log(editbox.string);
        this.labelTitleText.string = editbox.string;
    }
}

