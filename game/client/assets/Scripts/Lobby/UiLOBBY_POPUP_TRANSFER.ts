import { _decorator, Component, Node, Label, Button, EditBox } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
import { LobbySystemPopup } from '../LobbySystemPopup';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_TRANSFER')
export class UiLOBBY_POPUP_TRANSFER extends Component {
    @property(Label) labelTitle: Label = null;

    @property(Label) labelBank: Label = null;
    @property(Label) labelHolder: Label = null;
    @property(Label) labelAccount: Label = null;
    @property(Label) labelPhone: Label = null;

    @property(Label) labelBalance: Label = null;
    @property(Label) labelAfterBalance: Label = null;    

    @property(Label) labelKorAmount: Label = null;

    @property(EditBox) editboxTransferAmount: EditBox = null;
    @property(EditBox) editboxTransferPassword: EditBox = null;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;

    private cbEXIT: ()=>void = null;
    private cbAPPLY: ()=>void = null;
    
    private balance: number = 0;
    private remain: number = 0;

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
        this.labelTitle.string = '출금신청';

        this.labelBank.string = '';
        this.labelHolder.string = '';
        this.labelAccount.string = '';
        this.labelPhone.string = '';

        this.labelBalance.string = '0';
        this.labelAfterBalance.string = '0';

        this.labelKorAmount.string = '0';
        this.labelKorAmount.node.active = false;

        this.balance = 0;
        this.remain = 0;

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonApply.node.off( 'click' );
        this.buttonApply.node.on( 'click', this.onAPPLY.bind(this), this );

        this.editboxTransferAmount.node.on('editing-did-began', this.onAMOUNT_EDITBOX_DID_BEGAN.bind(this), this);
        this.editboxTransferAmount.node.on('editing-return', this.onAMOUNT_EDITBOX_RETURN.bind(this), this);
        this.editboxTransferAmount.node.on('text-changed', this.onAMOUNT_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editboxTransferAmount.node.on('editing-did-ended', this.onAMOUNT_EDITBOX_DID_ENDED.bind(this), this);

        this.editboxTransferPassword.node.on('editing-did-began', this.onPASSWORD_EDITBOX_DID_BEGAN.bind(this), this);
        this.editboxTransferPassword.node.on('editing-return', this.onPASSWORD_EDITBOX_RETURN.bind(this), this);
        this.editboxTransferPassword.node.on('text-changed', this.onPASSWORD_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editboxTransferPassword.node.on('editing-did-ended', this.onPASSWORD_EDITBOX_DID_ENDED.bind(this), this);
    }

    public Show( button: Button ) {
        button.interactable = true;
        this.Reset();

        NetworkManager.Instance().getUserInfoFromDB( (res: any)=>{
            let user = res.user;
            console.log( user );

            if ( user != null ) {
                this.labelBank.string = user.bank;
                this.labelHolder.string = user.holder;
                this.labelAccount.string = user.account;
                this.labelPhone.string = user.phone;
                this.balance = user.balance;

                this.labelBalance.string = CommonUtil.getKoreanNumber(this.balance);
                this.node.active = true;                
            }

        }, (err: any) => {
            LobbySystemPopup.instance.showPopUpOk('출금 신청', ' 정보를 불러올 수 없습니다.', ()=>{
                if ( this.cbEXIT != null ) {
                    this.cbEXIT();
                }
            });
        });
    }

    private Reset() {
        this.labelBank.string = '';
        this.labelHolder.string = '';
        this.labelAccount.string = '';
        this.labelPhone.string = '';
        this.balance = 0;
        this.remain = 0;

        this.editboxTransferAmount.string = '';
        this.editboxTransferPassword.string = '';
        this.labelBalance.string = '';
        this.labelAfterBalance.string = '';

        this.labelKorAmount.string = '0';
        this.labelKorAmount.node.active = false;

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
        let value: number = Number( this.editboxTransferAmount.string );
        let password: string = this.editboxTransferPassword.string;
        if ( password.length <= 0 ) {
            LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금 비밀번호를 입력해 주세요.', ()=>{
            });
            return;            
        }

        this.remain = this.balance - value;
        if ( value <= 0 || this.remain < 0 ) {
            LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금금액이 너무 작거나 소지금이 부족합니다.', ()=>{
            });
        } else {
            NetworkManager.Instance().reqTANSFER_REQUEST( {
                // value: value,
                // password: this.
            }, (res: any)=>{

            }, (err: any)=>{

            });
        }

        // if ( this.cbAPPLY != null ) {
        //     this.cbAPPLY();
        // }
    }

    private onAMOUNT_EDITBOX_RETURN( ditbox, customEventData ) {

    }

    private onAMOUNT_EDITBOX_DID_BEGAN( editbox, customEventData ) {
        editbox.string = '';
        this.labelAfterBalance.string = '0';

        this.labelKorAmount.string = '0';
        this.labelKorAmount.node.active = false;
    }

    private onAMOUNT_EDITBOX_DID_ENDED( editbox, customEventData ) {

    }

    private onAMOUNT_EDITBOX_TEXT_CHANGED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        let n = Number( editbox.string );
        let s = CommonUtil.getKoreanNumber( n );
        if ( s.length > 0) {
            this.labelKorAmount.string = s;
            this.labelKorAmount.node.active = true;

            let remain = this.balance - n;
            if ( remain < 0 ) {
                this.labelAfterBalance.string = '출금불가';
            } else {
                this.labelAfterBalance.string = CommonUtil.getKoreanNumber( remain );
            }
        }
    }

    private onPASSWORD_EDITBOX_RETURN( ditbox, customEventData ) {

    }

    private onPASSWORD_EDITBOX_DID_BEGAN( editbox, customEventData ) {
        editbox.string = '';
    }

    private onPASSWORD_EDITBOX_DID_ENDED( editbox, customEventData ) {

    }

    private onPASSWORD_EDITBOX_TEXT_CHANGED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        // let s = CommonUtil.getKoreanNumber( Number(editbox.string) );
        // this.labelKorValue.string = s;

    }
}

