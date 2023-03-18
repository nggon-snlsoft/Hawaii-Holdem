import { _decorator, Component, Node, Button, Label } from 'cc';
const { ccclass, property } = _decorator;

export enum LoginPopupType{
    None,
    Ok,
    YesOrNo
}

@ccclass('LoginPopUpElement')
export class LoginPopUpElement {

    @property(Node) private root : Node = null;
    @property(Node) private popUpOk : Node = null;
    @property(Node) private popUpYesOrNo : Node = null;

    @property(Button) private btnOk : Button = null;
    @property(Button) private btnYes : Button = null;
    @property(Button) private btnNo : Button = null;

    @property(Label) private lbTitle : Label = null;
    @property(Label) private lbContents : Label = null;

    private onClose : () => void = null;
    private onYes : () => void = null;
    private onNo : () => void = null;

    public init(){
        this.btnOk.node.on("click", this.onClickOk.bind(this), this);
        this.btnYes.node.on("click", this.onClickYes.bind(this), this);
        this.btnNo.node.on("click", this.onClickNo.bind(this), this);
    }

    private onClickOk(){
        this.hide();

        if(null != this.onClose){
            // LobbyAudioContoller.instance.playButtonClick();
            this.onClose();
        }
    }

    private onClickYes(){
        this.hide();

        if(null != this.onYes){
            // LobbyAudioContoller.instance.playButtonClick();
            this.onYes();
        }
    }

    private onClickNo(){
        this.hide();

        if(null != this.onNo){
            // LobbyAudioContoller.instance.playButtonClick();
            this.onNo();
        }
    }

    public show( type: LoginPopupType, title : string, content : string, closeCallback : () => void, yesCallback : () => void, noCallback : () => void){

        this.clear();

        this.lbTitle.string = title;

        this.lbContents.string = content;

        this.onClose = closeCallback;
        this.onYes = yesCallback;
        this.onNo = noCallback;

        this.popUpOk.active = false;
        this.popUpYesOrNo.active = false;

        switch ( type ) {
            case LoginPopupType.None:
                this.popUpOk.active = true;
                break;
            case LoginPopupType.Ok:
                this.popUpOk.active = true;
                break;
            case LoginPopupType.YesOrNo:
                this.popUpYesOrNo.active = true;
                break;
        }

        this.root.active = true;
    }

    public hide(){
        this.root.active = false;
    }

    public clear(){
        this.lbTitle.string = "";
        this.lbContents.string = "";

        this.onClose = null;
        this.onYes = null;
        this.onNo = null;
    }
}

@ccclass('LoginSystemPopup')
export class LoginSystemPopup extends Component {
    public static instance : LoginSystemPopup = null;

    @property(LoginPopUpElement)
    private uiPopUp : LoginPopUpElement = new LoginPopUpElement();

    private popupQueue : any[] = [];
    private isPopupShow : boolean = false;

    public initialize() {
        this.uiPopUp.init();
        this.uiPopUp.hide();

        this.closePopup();

        LoginSystemPopup.instance = this;        
    }

    public showPopUpOk( title : string, content : string, closeCallback? : () => void){
        this.popupQueue.push( {type : LoginPopupType.Ok, title : title, content : content, closeCallback : closeCallback, yesCallback : null, noCallback : null});
        this.showPopup();

        this.node.active = true;
    }

    public showPopUpYesOrNo(title : string, content : string, yesCallback? : () => void, noCallback? : () => void){
        this.popupQueue.push( {type : LoginPopupType.YesOrNo, title : title, content : content, closeCallback : null, yesCallback : yesCallback, noCallback : noCallback});
        this.showPopup();

        this.node.active = true;        
    }

    private showPopup(){
        this.uiPopUp.hide();

        if(this.popupQueue.length < 1){
            this.isPopupShow = false;
            return;
        }

        let showInfo : any = this.popupQueue[this.popupQueue.length - 1];

        if(null == showInfo){
            this.isPopupShow = false;
            return;
        }

        switch (showInfo.type)
        {
            case LoginPopupType.None:
            {
            }
                break;
            case LoginPopupType.Ok:
            {
                this.uiPopUp.show( LoginPopupType.Ok, showInfo.title, showInfo.content,  (()=> {
                    this.popupQueue.pop();
                    this.showPopup();

                    if(null != showInfo.closeCallback){
                        showInfo.closeCallback();
                    }
                }).bind(this), null, null);
            }
                break;
            case LoginPopupType.YesOrNo:
            {
                this.uiPopUp.show( LoginPopupType.YesOrNo, showInfo.title, showInfo.content, null, (() => {
                    this.popupQueue.pop();
                    this.showPopup();

                    if(null != showInfo.yesCallback){
                        showInfo.yesCallback();
                    }
                }), (() => {
                    this.popupQueue.pop();
                    this.showPopup();

                    if(null != showInfo.noCallback){
                        showInfo.noCallback();
                    }
                }))
            }
                break;
        }

    }

    private clear() {
        // this.labelTitle.string = '';
        // this.labelDescription.string = '';

        // this.nodeOkPopup.active = false;
        // this.nodeYesNoPopup.active = false;

        // this.cbOk = null;
        // this.cbYes = null;
        // this.cbNo = null;
    }

    public closePopup() {
        this.clear();
        this.node.active = false;
    }
}


