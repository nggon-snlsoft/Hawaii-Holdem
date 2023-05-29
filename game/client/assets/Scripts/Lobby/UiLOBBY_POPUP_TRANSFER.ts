import { _decorator, Component, Node, Label, Button, EditBox } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { ENUM_RESULT_CODE, NetworkManager } from '../NetworkManager';
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
    @property(Label) labelTransferMin: Label = null;

    @property(EditBox) editboxTransferAmount: EditBox = null;
    @property(EditBox) editboxTransferPassword: EditBox = null;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;

    private cbEXIT: ()=>void = null;
    private cbAPPLY: ()=>void = null;
    
    private balance: number = 0;
    private remain: number = 0;
    private transfer_min: number = 0;

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
        this.labelTransferMin.string = '';

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

        this.transfer_min = 10000;
        let conf = NetworkManager.Instance().GetConfig();
        if ( conf != null && conf.min_transfer ) {
            this.transfer_min = conf.min_transfer;
        }

        this.buttonApply.interactable = true;
        this.labelTransferMin.string = '( 최소 환전 신청금액: ' + CommonUtil.getKoreanNumber( this.transfer_min ) + ' )';

        NetworkManager.Instance().getTRANSFER_REQUESTS( ( res )=>{
            let transfers = res.transfers;
            let count = transfers.length;

            if ( count > 0 )
            {
                let total: number = 0;
                transfers.forEach( ( transfer )=>{
                    total += transfer.amount;
                } );

                let desc = count.toString() + ' 건 ( 총액: ' + CommonUtil.getKoreanNumber( total ) + ' ) 의 신청이 있습니다.\n계속 진행하시겠습니까? '
                LobbySystemPopup.instance.showPopUpYesOrNo( '환전 신청', desc, ()=>{
                    this.GetUserInfo();

                }, ()=>{
                    if ( this.cbEXIT != null ) {
                        this.cbEXIT();
                    }
                });
            } else {
                this.GetUserInfo();
            }
        }, (err)=>{
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
    }

    private GetUserInfo() {
        NetworkManager.Instance().getUSER_FromDB( (res: any)=>{
            let user = res.user;

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

    public Hide() {
        this.node.active = false;
    }

    private onEXIT( button: Button ) {
        if ( this.cbEXIT != null ) {
            this.cbEXIT();
        }
    }

    private onAPPLY( button: Button ) {
        button.interactable = false;
        let value: number = Number( this.editboxTransferAmount.string );
        let password: string = this.editboxTransferPassword.string;
        if ( password.length <= 0 ) {
            LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금 비밀번호를 입력해 주세요.', ()=>{
                button.interactable = true;
            });
            return;
        }

        if ( this.editboxTransferAmount.string.length == 0 || value < this.transfer_min ) {
            LobbySystemPopup.instance.showPopUpOk('출금 신청', CommonUtil.getKoreanNumber(this.transfer_min) + ' 이하는 환전신청 할수 없습니다.', ()=>{
                button.interactable = true;            
            });
            return;
        }

        this.remain = this.balance - value;
        if ( this.remain < 0 ) {
            LobbySystemPopup.instance.showPopUpOk('출금 신청', '소지금이 부족합니다.', ()=>{
                button.interactable = true;            
            });
            return;            
        }

        let desc = CommonUtil.getKoreanNumber( value ) + ' 출금 요청하시겠습니까?';
        LobbySystemPopup.instance.showPopUpYesOrNo( '출금 신청', desc, ()=>{
            NetworkManager.Instance().reqTRANSFER_REQUEST( {
                value: value,
                password: password
            }, ( res: any )=>{
                button.interactable = true;
                if ( res != null ) {
                    if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                        LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금 신청이 완료되었습니다.', ()=>{
                            if ( this.cbAPPLY != null ) {
                                this.cbAPPLY();
                            }
                        });
                    }
                    else {
                        if ( res.msg == 'INVALID_TRANSFER_PASSWORD') {
                            LobbySystemPopup.instance.showPopUpOk('출금 신청', '거래비빌번호가 잘못됐습니다.', ()=>{
                            });

                        } else {
                            LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금 신청이 실패했습니다.', ()=>{
                            });
                        }
                    }
                } else {
                    LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금 신청이 실패했습니다.', ()=>{
                    });                        
                }
            }, (err: any)=>{
                button.interactable = true;                
                LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금 신청이 실패했습니다.', ()=>{
                });
            });
        }, ()=>{
            button.interactable = true;
            LobbySystemPopup.instance.showPopUpOk('출금 신청', '출금신청이 취소되었습니다.', ()=>{
            });
        });
    }

    private onAMOUNT_EDITBOX_RETURN( editbox, customEventData ) {
        editbox.string = editbox.string.trim();
    }

    private onAMOUNT_EDITBOX_DID_BEGAN( editbox, customEventData ) {
        editbox.string = '';
        this.labelAfterBalance.string = '0';

        this.labelKorAmount.string = '0';
        this.labelKorAmount.node.active = false;
    }

    private onAMOUNT_EDITBOX_DID_ENDED( editbox, customEventData ) {
        editbox.string = editbox.string.trim();
    }

    private onAMOUNT_EDITBOX_TEXT_CHANGED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        editbox.string = editbox.string.trim();

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

    private onPASSWORD_EDITBOX_RETURN( editbox, customEventData ) {
        editbox.string = editbox.string.trim();
    }

    private onPASSWORD_EDITBOX_DID_BEGAN( editbox, customEventData ) {
        editbox.string = '';
    }

    private onPASSWORD_EDITBOX_DID_ENDED( editbox, customEventData ) {
        editbox.string = editbox.string.trim();
    }

    private onPASSWORD_EDITBOX_TEXT_CHANGED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();        

        // let s = CommonUtil.getKoreanNumber( Number(editbox.string) );
        // this.labelKorValue.string = s;

    }
}

