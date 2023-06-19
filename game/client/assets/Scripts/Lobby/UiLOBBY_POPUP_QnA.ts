import { _decorator, Component, Node, Label, Button, instantiate, Sprite, Layout, ScrollView, EditBox, Color, Toggle } from 'cc';
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

@ccclass('MessageElement')
export class MessageElement {
    @property( Node ) rootNode: Node = null;
    @property( Button ) buttonMessage: Button = null;
    @property( Sprite) spriteUnread: Sprite = null;    
    @property( Label ) labelTitle: Label = null;
    @property( Label ) labelSender: Label = null;
    @property( Label ) labelDate: Label = null;

    private message: any = null;
    private cbSelect: ( info: any )=> void = null;

    public CopyObject(): MessageElement {
        let o: MessageElement = new MessageElement();
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

@ccclass('UiLOBBY_POPUP_QnA')
export class UiLOBBY_POPUP_QnA extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Node) rootQNA: Node = null;
    @property(Node) rootMessage: Node = null;

    @property(Toggle) toggleQNA: Toggle = null;
    @property(Toggle) toggleMessage: Toggle = null;

    @property(Node) PANEL_QNA_LIST: Node = null;
    @property(Node) PANEL_QNA_INPUT: Node = null;
    @property(Node) PANEL_QNA_SHOW: Node = null;
    
    @property(Node) PANEL_MESSAGE_LIST: Node = null;
    @property(Node) PANEL_MESSAGE_SHOW: Node = null;        

    @property(Layout) layoutQnAList: Layout = null;
    @property(Layout) layoutMessageList: Layout = null;    

    @property(ScrollView) svQnAs: ScrollView = null;
    @property(ScrollView) svMessagess: ScrollView = null;    

    @property(QnAElement) originQNA: QnAElement = new QnAElement();
    @property(MessageElement) originMessage: MessageElement = new MessageElement();

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
    
    @property(Button) buttonMessageBack: Button = null;

    @property(Label) labelShowTitleText: Label = null;
    @property(Label) labelShowQuestionText: Label = null;
    @property(Label) labelShowAnswerText: Label = null;
    @property(Label) labelShowPending: Label = null;

    @property(Label) labelMessageTitle: Label = null;
    @property(Label) labelMessageSender: Label = null;
    @property(Label) labelMessageDescription: Label = null;
    @property(Label) labelMessageUpdate: Label = null;    

    @property(Label) labelQuestionUpdate: Label = null;
    @property(Label) labelAnswerUpdate: Label = null;    

    @property(Node) BADGE_QNA: Node = null;
    @property(Node) BADGE_MESSAGE: Node = null;    

    @property(Label) labelQNAUnread: Label = null;
    @property(Label) labelMessageUnread: Label = null;    

    private QNAAElementOnList: QnAElement[] = [];
    private MessageElementOnList: MessageElement[] = [];    

    private cbEXIT: ()=>void = null;
    private cbAPPLY: ()=>void = null;
    private selectedInfo: any = null;
    private selectedMessage: any = null;

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

        this.rootQNA.active = false;
        this.rootMessage.active = false;

        this.PANEL_QNA_LIST.active = false;
        this.PANEL_QNA_INPUT.active = false;
        this.PANEL_QNA_SHOW.active = false;

        this.PANEL_MESSAGE_LIST.active = false;
        this.PANEL_MESSAGE_SHOW.active = false;

        this.labelShowTitleText.string = '';
        this.labelShowQuestionText.string = '';
        this.labelShowAnswerText.string = '';
        this.labelShowPending.string = '';
        this.labelQuestionUpdate.string = '';
        this.labelAnswerUpdate.string = '';
        this.selectedInfo = null;
        
        this.labelQNAUnread.string = '0';
        this.labelMessageUnread.string = '0';

        this.BADGE_QNA.active = false;
        this.BADGE_MESSAGE.active = false;

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

        this.buttonMessageBack.node.off( 'click' );
        this.buttonMessageBack.node.on( 'click', this.onBACK_MESSAGE_LIST.bind(this), this );

        this.buttonDelete.node.off( 'click' );
        this.buttonDelete.node.on( 'click', this.onDELETE_QNA.bind(this), this );        

        this.buttonSend.node.off( 'click' );
        this.buttonSend.node.on( 'click', this.onSEND_QNA.bind(this), this );

        this.buttonCancel.node.off( 'click' );
        this.buttonCancel.node.on( 'click', this.onSEND_CANCEL.bind(this), this );

        this.toggleQNA.node.on('toggle', this.onTOGGLE_QNA.bind(this), null);
        this.toggleMessage.node.on('toggle', this.onTOGGLE_MESSAGE.bind(this), null);
    }

    public Show( button: Button ) {
        this.originQNA.rootNode.active = false;
        this.originMessage.rootNode.active = false;

        this.rootQNA.active = true;
        this.rootMessage.active = false;

        this.PANEL_QNA_INPUT.active = false;
        this.PANEL_QNA_SHOW.active = false;

        this.selectedInfo = null;
        this.toggleQNA.isChecked = true;

        this.onREFRESH_UNREAD( ()=>{
            button.interactable = true;
            this.onREFRESH();
            this.node.active = true;
        });
    }

    private onREFRESH_UNREAD( done: ()=>void  ) {
        NetworkManager.Instance().reqUNREAD( (res: any)=>{
            console.log( res );
            if ( res != null ) {
                if ( res.unread_answer != null && res.unread_answer > 0 ) {
                    this.labelQNAUnread.string = (res.unread_answer).toString();
                    this.BADGE_QNA.active = true;

                } else {
                    this.BADGE_QNA.active = false;
                }

                if ( res.unread_message != null && res.unread_message > 0 ) {
                    this.labelMessageUnread.string = (res.unread_message).toString();
                    this.BADGE_MESSAGE.active = true;                    
                } else {
                    this.BADGE_MESSAGE.active = false;
                }

                if ( done != null ) {
                    done();
                }

            }
        }, (err:any)=>{
            this.BADGE_QNA.active = false;
            this.BADGE_MESSAGE.active = false;

            if ( done != null ) {
                done();
            }
        } );        
    }

    private onREFRESH() {
        this.selectedInfo = null;
        NetworkManager.Instance().reqGET_QNA( (res: any)=>{
            if ( res != null ) {
                this.PANEL_QNA_LIST.active = true;
                this.ShowList( res.qnas );
            }
        }, (err:any)=>{

        } );        
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

    private onSELECT_QNA( info:any ) {
        this.ClearShowPanel();

        this.selectedInfo = info;
        this.PANEL_QNA_LIST.active = false;
        this.PANEL_QNA_INPUT.active = false;
        this.PANEL_QNA_SHOW.active = true;

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

                    this.onREFRESH_UNREAD(()=>{
                    
                    });
                    
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

    private onSELECT_MESSAGE( message:any ) {
        this.ClearShowMessagePanel();
        this.selectedMessage = message;

        this.PANEL_MESSAGE_LIST.active = false;

        this.labelMessageTitle.string = this.selectedMessage.title;
        this.labelMessageSender.string = '보낸사람: 운영자';
        this.labelMessageDescription.string = this.selectedMessage.description;
        this.labelMessageUpdate.string = this.selectedMessage.createDate;

        if ( this.selectedMessage.unread == 1 ) {
            NetworkManager.Instance().reqREAD_MESSAGE( this.selectedMessage.id, (res: any )=>{
                this.onREFRESH_UNREAD(()=>{

                });
            }, ( err: any )=>{
            });
        }

        this.PANEL_MESSAGE_SHOW.active = true;
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

    private ClearShowMessagePanel() {
        
        this.labelMessageTitle.string = '';
        this.labelMessageSender.string = '';
        this.labelMessageDescription.string = '';
        this.labelMessageUpdate.string = '';

        this.selectedMessage = null;
    }

    private ClearList() {
        this.selectedInfo = null;
        this.selectedMessage = null;
        this.DestoryElements();
    }

    private DestoryElements() {
        this.QNAAElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;
        } );

        this.MessageElementOnList.forEach( (e)=>{
            e.rootNode.destroy();
            e.rootNode = null;
        });

        this.QNAAElementOnList = [];
        this.MessageElementOnList = [];
    }

    public Hide() {
        this.selectedInfo = null;
        this.selectedMessage = null;
        this.DestoryElements();
        this.node.active = false;
    }

    private onEXIT( button: Button ) {
        if ( this.cbEXIT != null ) {
            this.cbEXIT();
        }
    }

    private onWRITE( button: Button ) {
        this.PANEL_QNA_LIST.active = false;
        this.PANEL_QNA_INPUT.active = true;

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
        this.PANEL_QNA_SHOW.active = false;
        this.PANEL_QNA_INPUT.active = false;
        this.PANEL_QNA_LIST.active = true;

        this.onREFRESH();
    }

    private onBACK_MESSAGE_LIST( button: Button ) {
        this.PANEL_MESSAGE_SHOW.active = false;
        this.PANEL_MESSAGE_LIST.active = true;

        this.onMESSAGE_REFRESH();
    }

    private onDELETE_QNA( button: Button  ) {
        LobbySystemPopup.instance.showPopUpYesOrNo('문의사항', '현재 문의를 삭제하시겠습니까?', ()=>{
            this.DELETE_QNA();

        }, ()=>{

        });
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
        this.PANEL_QNA_SHOW.active = false;
        this.PANEL_QNA_INPUT.active = false;
        this.PANEL_QNA_LIST.active = true;

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
        this.PANEL_QNA_SHOW.active = false;
        this.PANEL_QNA_INPUT.active = false;
        this.PANEL_QNA_LIST.active = true;

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

    private onTOGGLE_QNA( toggle: Toggle ) {
        if ( toggle.isChecked == true ) {
            this.rootQNA.active = true;
            this.rootMessage.active = false;

            NetworkManager.Instance().reqGET_QNA( (res: any)=>{
                if ( res != null ) {
                    this.ShowList( res.qnas );
                }
    
                this.PANEL_QNA_LIST.active = true;
                this.node.active = true;
    
            }, (err:any)=>{
                this.PANEL_QNA_LIST.active = true;
                this.node.active = true;
            } );
    
        }
    }

    private onTOGGLE_MESSAGE( toggle: Toggle ) {
        if ( toggle.isChecked == true ) {
            this.rootQNA.active = false;
            this.rootMessage.active = true;

            NetworkManager.Instance().reqMESSAGE( (res: any)=>{
                
                if ( res != null ) {
                    this.ShowMessageList( res.messages );
                }

                this.PANEL_MESSAGE_LIST.active = true;
                this.PANEL_MESSAGE_SHOW.active = false;

                this.node.active = true;
    
            }, (err:any)=>{
                this.PANEL_MESSAGE_LIST.active = true;
                this.PANEL_MESSAGE_SHOW.active = false;

                this.node.active = true;
            } );
        }
    }
}

