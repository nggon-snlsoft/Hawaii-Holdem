import { _decorator, Component, Node, Label, Button, instantiate, Sprite, Layout, ScrollView, EditBox, Color } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { CommonUtil } from '../CommonUtil';
import { EDITOR } from 'cc/env';
import { LobbySystemPopup } from '../LobbySystemPopup';
const { ccclass, property } = _decorator;

const MAX_TITLE_COUNT: number = 30;
const MAX_DESCRIPTION_COUNT: number = 100;

@ccclass('QnAElement')
export class QnAElement {
    @property( Node ) rootNode: Node = null;
    @property( Sprite ) spriteSlot: Sprite = null;
    @property( Label ) labelTitle: Label = null;
    @property( Button ) buttonQNA: Button = null;    
    @property( Sprite) spriteUnread: Sprite = null;
    @property( Sprite) spriteButton: Sprite = null;
    @property( Label ) labelButton: Label = null;
    @property( Label ) labelDate: Label = null;

    private qna: any = null;
    private cbSelect: ( info: any )=> void = null;

    public CopyObject(): QnAElement {
        let o: QnAElement = new QnAElement();
        let n = instantiate( this.rootNode );

        o.rootNode = n;
        o.spriteSlot = n.getChildByPath('SPRITE_SLOT').getComponent( Sprite );
        o.spriteUnread = n.getChildByPath('VALUES/TITLE/SPRITE_UNREAD').getComponent( Sprite );        
        o.labelTitle = n.getChildByPath('VALUES/TITLE/LABEL_TITLE').getComponent( Label );
        o.buttonQNA = n.getChildByPath('BUTTON_SHOW').getComponent( Button );
        o.spriteButton = n.getChildByPath('BUTTON_SHOW').getComponent( Sprite );
        o.labelButton = n.getChildByPath('BUTTON_SHOW/LABEL_BUTTON').getComponent( Label );                
        o.labelDate = n.getChildByPath('VALUES/LABEL_DATE').getComponent( Label);

        return o;
    }

    public Clear() {
        this.labelTitle.string = '';        
        this.labelDate.string = '';
        this.spriteUnread.node.active = false;

        this.cbSelect = null;
    }

    public Set( info: any, cb: ( info: any )=>void ) {
        this.qna = info;
        this.labelTitle.string = CommonUtil.TruncateString(info.title, 15) ;
        this.labelDate.string = info.questionDate;

        if ( info.pending == 1) {
            this.labelButton.string = '문의보기';
            this.spriteButton.color = new Color(50, 50, 50, 255);
            this.spriteSlot.color = new Color(14, 30, 60, 255);

        } else {
            this.labelButton.string = '답변보기';
            this.spriteButton.color = new Color(0, 0, 0, 255);
            this.spriteSlot.color = new Color(58, 94, 168, 255);
        }

        if ( cb != null ) {
            this.cbSelect = cb;
        }

        if ( info.pending == 0 && info.unread == 1 ) {
            this.spriteUnread.node.active = true; 
        } else {
            this.spriteUnread.node.active = false;             
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
    @property(EditBox) editboxQuestion: EditBox = null;

    @property(Button) buttonActivateTitle: Button = null;
    @property(Label) labelTitleText: Label = null;

    @property(Label) labelTitleCount: Label = null;
    @property(Label) labelDescCount: Label = null;

    @property(Button) buttonExit: Button = null;

    @property(Button) buttonSend: Button = null;
    @property(Button) buttonCancel: Button = null;    
    @property(Button) buttonWrite: Button = null;
    @property(Button) buttonBack: Button = null;
    @property(Button) buttonDelete: Button = null;    

    @property(Label) labelShowTitleText: Label = null;
    @property(Label) labelShowQuestionText: Label = null;
    @property(Label) labelShowAnswerText: Label = null;
    @property(Label) labelShowPending: Label = null;

    @property(Label) labelQuestionUpdate: Label = null;
    @property(Label) labelAnswerUpdate: Label = null;    

    private QNAAElementOnList: QnAElement[] = [];

    private cbEXIT: ()=>void = null;
    private cbAPPLY: ()=>void = null;
    private selectedInfo: any = null;    

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
        this.labelQuestionUpdate.string = '';
        this.labelAnswerUpdate.string = '';
        this.selectedInfo = null;        

        this.editboxTitle.node.on('editing-did-began', this.onTITLE_EDITBOX_DID_BEGAN.bind(this), this);
        this.editboxTitle.node.on('editing-return', this.onTITLE_EDITBOX_RETURN.bind(this), this);
        this.editboxTitle.node.on('text-changed', this.onTITLE_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editboxTitle.node.on('editing-did-ended', this.onTITLE_EDITBOX_DID_ENDED.bind(this), this);

        this.editboxQuestion.node.on('editing-did-began', this.onQUESTION_EDITBOX_DID_BEGAN.bind(this), this);
        this.editboxQuestion.node.on('editing-return', this.onQUESTION_EDITBOX_RETURN.bind(this), this);
        this.editboxQuestion.node.on('text-changed', this.onQUESTION_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editboxQuestion.node.on('editing-did-ended', this.onQUESTION_EDITBOX_DID_ENDED.bind(this), this);        

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonWrite.node.off( 'click' );
        this.buttonWrite.node.on( 'click', this.onWRITE.bind(this), this );

        this.buttonActivateTitle.node.off( 'click' );
        this.buttonActivateTitle.node.on( 'click', this.onACTIVATE_TITLE.bind(this), this );

        this.buttonBack.node.off( 'click' );
        this.buttonBack.node.on( 'click', this.onBACK_LIST.bind(this), this );

        this.buttonDelete.node.off( 'click' );
        this.buttonDelete.node.on( 'click', this.onDELETE_QNA.bind(this), this );        

        this.buttonSend.node.off( 'click' );
        this.buttonSend.node.on( 'click', this.onSEND_QNA.bind(this), this );

        this.buttonCancel.node.off( 'click' );
        this.buttonCancel.node.on( 'click', this.onSEND_CANCEL.bind(this), this );
    }

    public Show( button: Button ) {
        this.originQNA.rootNode.active = false;

        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_SHOW.active = false;

        this.selectedInfo = null;

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
        this.selectedInfo = null;
        NetworkManager.Instance().reqGET_QNA( (res: any)=>{
            if ( res != null ) {
                this.ShowList( res.qnas );
            }
        }, (err:any)=>{

        } );        
    }

    private ShowList( qnas: any[] ) {
        if ( qnas == null ) {
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

        this.selectedInfo = info;
        this.rootPANEL_LIST.active = false;
        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_SHOW.active = true;

        this.labelShowTitleText.string = info.title;
        this.labelShowQuestionText.string = info.question;

        if ( info.pending == 1 ) {
            this.labelShowAnswerText.node.active = false;

            this.labelShowPending.string = '답변 대기중...'
            this.labelShowPending.node.active = true;
            this.labelQuestionUpdate.string = info.questionDate;
            this.labelQuestionUpdate.node.active = true;

            this.labelAnswerUpdate.node.active = false;
        } else {
            if ( info.unread == 1 ) {
                this.buttonExit.interactable = false;
                this.buttonBack.interactable = false;
                this.buttonDelete.interactable = false;

                NetworkManager.Instance().reqREAD_QNA(info.id, (res: any )=>{
                    this.buttonExit.interactable = true;
                    this.buttonBack.interactable = true;
                    this.buttonDelete.interactable = true;
                }, ( err: any )=>{
                    this.buttonExit.interactable = true;
                    this.buttonBack.interactable = true;
                    this.buttonDelete.interactable = true;
                });
            }

            if ( info.answer != null ) {
                this.labelShowAnswerText.string = info.answer;
                this.labelShowAnswerText.node.active = true;
            } else {
                this.labelShowAnswerText.string = '';
                this.labelShowAnswerText.node.active = true;                
            }

            this.labelAnswerUpdate.string = info.answerDate;
            this.labelAnswerUpdate.node.active = true;

            this.labelQuestionUpdate.node.active = false;
        }
    }

    private ClearShowPanel() {
        this.labelShowTitleText.string = '';
        this.labelShowQuestionText.string = '';
        this.labelShowAnswerText.string = '';
        this.labelShowPending.string = '답변 대기중...'
        this.labelShowPending.node.active = false;
        this.labelQuestionUpdate.string = '';
        this.labelAnswerUpdate.string = '';

        this.selectedInfo = null;
    }

    private ClearList() {
        this.selectedInfo = null;        
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
        this.selectedInfo = null;
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

        this.onRESET_WRITE();
    }    

    private onRESET_WRITE() {
        this.editboxTitle.string = '';
        this.editboxQuestion.string = '';

        this.labelTitleCount.string = ' ( '+ (this.editboxTitle.string.length).toString() + ' / ' + MAX_TITLE_COUNT.toString() + ' )'
        this.labelDescCount.string = ' ( '+ (this.editboxQuestion.string.length).toString() + ' / ' + MAX_DESCRIPTION_COUNT.toString() + ' )'
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

    private onDELETE_QNA( button: Button  ) {
        LobbySystemPopup.instance.showPopUpYesOrNo('문의사항', '현재 문의를 삭제하시겠습니까?', ()=>{
            this.DELETE_QNA();

        }, ()=>{
        })

    }
    
    private DELETE_QNA() {
        if ( this.selectedInfo != null ) {
            this.buttonBack.interactable = false;
            this.buttonExit.interactable = false;

            NetworkManager.Instance().reqDELETE_QNA( this.selectedInfo.id, ( res: any )=>{
                this.buttonBack.interactable = true;
                this.buttonExit.interactable = true;
                this.onSHOW_LIST();

                LobbySystemPopup.instance.showPopUpOk('문의', '문의를 삭제했습니다.', ()=>{

                });
            }, ( err: any )=>{
                this.buttonBack.interactable = true;
                this.buttonExit.interactable = true;                
                LobbySystemPopup.instance.showPopUpOk('문의', '문의를 삭제할 수 없습니다.', ()=>{

                });
            } );
        } else {
            LobbySystemPopup.instance.showPopUpOk('문의', '문의를 삭제할 수 없습니다.', ()=>{
            });
        }
    }

    private onSHOW_LIST() {
        this.rootPANEL_SHOW.active = false;
        this.rootPANEL_INPUT.active = false;
        this.rootPANEL_LIST.active = true;

        this.onREFRESH();        
    }
    
    private onSEND_QNA( button: Button ) {
        let t = this.editboxTitle.string;
        let q = this.editboxQuestion.string;
        button.interactable = false;

        if ( t.length <= 0 || q.length <= 0 ) {
            LobbySystemPopup.instance.showPopUpOk('문 의', '제목과 문의내용을 입력해주세요.', ()=>{
                button.interactable = true;
            });
            return;
        }

        NetworkManager.Instance().reqSEND_QNA( {
            title: t,
            question: q
        }, (res)=>{
            button.interactable = true;            
            if ( res != null && res.affected > 0 ) {
                LobbySystemPopup.instance.showPopUpOk('문 의', '문의 보내기가 성공했습니다.', ()=>{
                    this.onSHOW_LIST();
                });
            } else {
                LobbySystemPopup.instance.showPopUpOk('문 의', '문의 보내기가 실패했습니다.', ()=>{
                    this.onRESET_WRITE();
                });
            }

        }, (err)=>{
            button.interactable = true;            
            LobbySystemPopup.instance.showPopUpOk('문 의', '문의 보내기가 실패했습니다.', ()=>{
                this.onRESET_WRITE();
            });
        });
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
    }    

    private onTITLE_EDITBOX_RETURN( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
    }

    private onTITLE_EDITBOX_DID_ENDED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
    }

    private onTITLE_EDITBOX_TEXT_CHANGED( editbox ) {
        this.labelTitleCount.string = '( ' + (editbox.string.length).toString() + ' / ' + MAX_TITLE_COUNT.toString() + ' )';
        let c = '\t';
        if ( editbox.string.includes(c) == true ) {
            editbox.string = editbox.string.replace(c, '');
            editbox.blur();
        }
    }

    private onQUESTION_EDITBOX_DID_BEGAN( editbox ) {
        editbox.string = '';
    }    

    private onQUESTION_EDITBOX_RETURN( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
    }

    private onQUESTION_EDITBOX_DID_ENDED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
    }

    private onQUESTION_EDITBOX_TEXT_CHANGED( editbox ) {
        this.labelDescCount.string = '( ' + (editbox.string.length).toString() + ' / ' + MAX_DESCRIPTION_COUNT.toString() + ' )';
        let c = '\t';
        if ( editbox.string.includes(c) == true ) {
            editbox.string = editbox.string.replace(c, '');            
            editbox.blur();
        }
    }
}

