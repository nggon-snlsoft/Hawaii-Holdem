import { _decorator, Component, Node, Button, instantiate, Sprite, Toggle, Label } from 'cc';
const { ccclass, property } = _decorator;
import { CommonUtil } from '../CommonUtil';
import { AudioController } from './AudioController';

export enum EMOTICON_TYPE {
    Emoticon,
    Chatting,
}

export let EMOTICON_CHAT_MESSAGE: string[] = [
    'ㅋㅋㅋㅋ',
    '빨리 빨리',
    '화장실 다녀올게요',
    '다음에 또봐요',
    '맛있당',
    '안녕하세요!',
    '죄송합니다~',
    '감사합니다!',
    '나이스 콜!',
    '나이스 핸드!',                                
    '나이스 벳!',        
    '나이스 폴드!',
    '결대로 가자!',
    '가는 길이 달라!',
    '열린다 열려...',
    '홀덤은 흐름이지!',
    '싹~ 다 가져와!',
    '블러핑 같은데...',
    '이게 안 뜨네..',
    '드루와 드루와!',
    '다음판 올인!',
    '이게 머선 129?',
    '선 넘네...',
]

@ccclass('EmoticonElement')
export class EmoticonElement {
    @property(Node) nodeRoot: Node = null;
    @property(Button) emoticon: Button = null;

    private id: number = -1;
    private cb: (num: number, button: Button)=>void = null;

    public copy(): EmoticonElement {
        let copyObj: EmoticonElement = new EmoticonElement();
        let newObj: Node = instantiate( this.nodeRoot );

        copyObj.nodeRoot = newObj;
        copyObj.emoticon = newObj.getComponent(Button);
        copyObj.nodeRoot.active = false;

        return copyObj;
    }

    public clear() {
        this.id = -1;
    }

    public setParent( parent: Node ) {
        this.nodeRoot.parent = parent;
    }

    public setEmoticon(id: number, cb:(num: number)=>void ) {
        this.id = id;

        if (cb != null) {
            this.cb = cb;
        }

        this.nodeRoot.active = true;
        this.emoticon.node.active = true;

        let s = this.nodeRoot.getComponent(Sprite);
        if ( s != null) {
            CommonUtil.setEmoticonSprite( id, s, ()=>{
                this.nodeRoot.active = true;
            });
        }

        this.emoticon.node.on('click', this.onClick.bind(this));
    }

    private onClick( button: Button ) {
        if ( this.cb != null ) {
            this.cb( this.id, button );
        }
    }
}

@ccclass('ChattingElement')
export class ChattingElement {
    @property(Node) nodeRoot: Node = null;
    @property(Button) buttonChatting: Button = null;
    @property(Label) labelChatting: Label = null;    

    private id: number = -1;
    private cb: (num: number, button: Button)=>void = null;

    public copy(): ChattingElement {
        let copyObj: ChattingElement = new ChattingElement();
        let newObj: Node = instantiate( this.nodeRoot );

        copyObj.nodeRoot = newObj;
        copyObj.buttonChatting = newObj.getComponent(Button);
        copyObj.labelChatting = newObj.getChildByPath('LABEL_CHATTING').getComponent(Label);        
        copyObj.nodeRoot.active = false;

        return copyObj;
    }

    public clear() {
        this.id = -1;
    }

    public setParent( parent: Node ) {
        this.nodeRoot.parent = parent;
    }

    public setChatting(id: number, chat: string, cb:(num: number)=>void ) {
        this.id = id;

        if (cb != null) {
            this.cb = cb;
        }

        this.nodeRoot.active = true;
        this.labelChatting.string = chat;

        this.buttonChatting.node.on('click', this.onClick.bind(this));
    }

    private onClick( button: Button ) {
        if ( this.cb != null ) {
            AudioController.instance.ButtonClick();
            this.cb( this.id, button );
        }
    }
}

@ccclass('UiGameChatting')
export class UiGameChatting extends Component {
    @property(Button) buttonExit: Button = null;
    @property(EmoticonElement) originEmoticonElement: EmoticonElement = new EmoticonElement();
    @property(ChattingElement) originChattingElement: ChattingElement = new ChattingElement();

    @property(Node) nodeEmoticonContents: Node = null;
    @property(Node) nodeChattingContents: Node = null;    

    @property(Toggle) toggleEmoticon: Toggle = null;
    @property(Toggle) toggleChatting: Toggle = null;

    @property(Node) nodeEmoticonPanel: Node = null;
    @property(Node) nodeChattingPanel: Node = null;
    
    private cbExit: ()=>void = null;
    private cbSelect: ( type: EMOTICON_TYPE, id: number )=> void = null;    
    private isSet: boolean = false;


    init ( cbSelect: ( type: EMOTICON_TYPE, id: number )=>void, cbExit: ()=>void ) {
        if ( cbSelect != null ) {
            this.cbSelect = cbSelect;
        }

        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }

        if ( this.isSet == false ) {
            for ( let i = 0 ; i < 10 ; i++) {
                let e = this.originEmoticonElement.copy();
                e.setEmoticon(i, this.onClickEmoticon.bind(this) );
                e.setParent( this.nodeEmoticonContents );

                e.nodeRoot.active = true;
            }
            this.isSet = true;

            for ( let i = 0 ; i < EMOTICON_CHAT_MESSAGE.length ; i++) {
                let e = this.originChattingElement.copy();
                e.setChatting(i, EMOTICON_CHAT_MESSAGE[i], this.onClickChatting.bind(this) );
                e.setParent( this.nodeChattingContents );

                e.nodeRoot.active = true;
            }
            this.isSet = true;
        }

        this.buttonExit.node.on("click", this.onClickExit.bind(this));
        this.toggleEmoticon.node.on('toggle', this.onToggleEmoticon.bind(this));
        this.toggleChatting.node.on('toggle', this.onToggleChatting.bind(this));

        this.node.active = false;
    }

    show() {
        this.toggleEmoticon.isChecked = true;
        this.nodeChattingPanel.active = false;
        this.nodeEmoticonPanel.active = true;

        this.node.active = true;
    }

    public onClickExit(button: Button) {
        AudioController.instance.ButtonClick();        
        this.hide();
    }    

    onClickEmoticon(id: number, button: Button) {
        this.cbSelect(EMOTICON_TYPE.Emoticon, id);
        AudioController.instance.ButtonClick();
        this.hide();
    }

    onClickChatting(id: number, button: Button) {
        AudioController.instance.ButtonClick();
        this.cbSelect(EMOTICON_TYPE.Chatting, id);
        this.hide();
    }    

    onToggleEmoticon(toggle: Toggle ) {
        if ( toggle.isChecked == false ) {
            return;
        }

        this.nodeEmoticonPanel.active = true;
        this.nodeChattingPanel.active = false;
    }

    onToggleChatting(toggle: Toggle) {
        if ( toggle.isChecked == false ) {
            return;
        }

        this.nodeEmoticonPanel.active = false;
        this.nodeChattingPanel.active = true;
    }

    hide() {
        this.node.active = false;
    }
}


