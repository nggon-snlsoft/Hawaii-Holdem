import { _decorator, Component, Node, Label, Button, EditBox, EventHandler } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { CommonUtil } from '../CommonUtil';
import { LobbySystemPopup } from '../LobbySystemPopup';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_CHARGE')
export class UiLOBBY_POPUP_CHARGE extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Label) labelContact: Label = null;        
    @property(Label) labelAccount: Label = null;    
    @property(Label) labelHolder: Label = null;
    @property(Label) labelChargeMin: Label = null;
    @property(Label) labelKorValue: Label = null;

    @property(EditBox) editboxChargeAmount: EditBox = null;
    @property(EditBox) editboxChargeHolder: EditBox = null;    

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;

    private charge_min: number = 0;

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

        this.editboxChargeAmount.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editboxChargeAmount.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editboxChargeAmount.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editboxChargeAmount.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.node.active = false;
        this.labelTitle.string = '충 전';

        this.labelAccount.string = '';
        this.labelAccount.node.active = false;

        this.labelHolder.string = '';
        this.labelHolder.node.active = false;

        this.labelContact.string = '';
        this.labelContact.node.active = false;

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonApply.node.off( 'click' );
        this.buttonApply.node.on( 'click', this.onAPPLY.bind(this), this );
    }

    public Show( button: Button ) {
        button.interactable = true;
        this.Reset();

        this.charge_min = 10000;
        let conf = NetworkManager.Instance().GetConfig();
        if ( conf != null && conf.min_charge ) {
            this.charge_min = conf.min_charge;
        }

        this.labelChargeMin.string = '( 최소 충전신청금액: ' + CommonUtil.getKoreanNumber( this.charge_min ) + ' )';

        NetworkManager.Instance().getCHARGE_REQUESTS( ( res )=>{
            let charges = res.charges;
            let count = charges.length;

            if ( count > 0 )
            {
                let total: number = 0;
                charges.forEach( ( charge )=>{
                    total += charge.amount;
                } );

                let desc = count.toString() + ' 건 ( 총액: ' + CommonUtil.getKoreanNumber( total ) + ' ) 의 신청이 있습니다.\n계속 진행하시겠습니까? '
                LobbySystemPopup.instance.showPopUpYesOrNo( '충전 신청', desc, ()=>{
                    this.GetStoreInfo();

                }, ()=>{
                    if ( this.cbEXIT != null ) {
                        this.cbEXIT();
                    }
                });
            } else {
                this.GetStoreInfo();
            }
        }, (err)=>{
            LobbySystemPopup.instance.showPopUpOk('충전 신청', ' 정보를 불러올 수 없습니다.', ()=>{
                if ( this.cbEXIT != null ) {
                    this.cbEXIT();
                }
            });
        });
    }

    private Reset() {
        // this.labelHolder.string = '';
        this.editboxChargeAmount.string = '';
        this.editboxChargeHolder.string = '';
        this.labelKorValue.string = '';
        this.labelKorValue.node.active = false;
    }

    private GetStoreInfo() {
        NetworkManager.Instance().reqCOMPANY( ( res: any )=>{
            let store = res.store;
            if ( store != null ) {

                let telegram: string = '';
                if ( store.telegram != null && store.telegram.length > 0 ) {
                    telegram = store.telegram;
                }

                let kakao: string = '';
                if ( store.kakao != null && store.kakao.length > 0 ) {
                    kakao = store.kakao;
                }

                this.labelContact.string = '텔레그램: ' + telegram + '\n' + '카카오톡: ' + kakao ;
                this.labelContact.node.active = true;
            }

            this.labelKorValue.string = '';
            this.editboxChargeAmount.string = '';
            this.node.active = true;
        }, (err: any)=>{
            LobbySystemPopup.instance.showPopUpOk('충전 신청', ' 정보를 불러올 수 없습니다.', ()=>{
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
        let num = Number(this.editboxChargeAmount.string);
        let holder = this.editboxChargeHolder.string;

        if ( num < this.charge_min ) {
            LobbySystemPopup.instance.showPopUpOk('충전 신청', CommonUtil.getKoreanNumber( this.charge_min ) + ' 이하는 신청할 수 없습니다.', ()=>{

            })
            return;
        }

        if ( holder.length <= 0 ) {
            LobbySystemPopup.instance.showPopUpOk('충전 신청', ' 입금자명을 입력해 주세요.', ()=>{

            })
            return;
        }

        let s = CommonUtil.getKoreanNumber( Number( this.editboxChargeAmount.string ) );
        LobbySystemPopup.instance.showPopUpYesOrNo('충전 신청', s + ' 충전을 신청하시겠습니까?' ,()=>{
            this.RequestCharge();
        }, ()=>{
            LobbySystemPopup.instance.showPopUpOk('충전 신청', '충전 신청을 취소했습니다.', ()=>{

            });
        });
    }

    private RequestCharge() {
        let amount = Number( this.editboxChargeAmount.string );
        let holder = this.editboxChargeHolder.string;
        let desc = CommonUtil.getKoreanNumber(amount);
        NetworkManager.Instance().reqCHARGE_REQUEST( {
            amount: amount,
            holder: holder
        }, (res)=>{
            LobbySystemPopup.instance.showPopUpOk('충전 신청', desc + ' 충전 신청 했습니다.', ()=>{
                if ( this.cbEXIT != null ) {
                    this.cbEXIT();
                }
            });
        }, (err)=>{
            LobbySystemPopup.instance.showPopUpOk('충전 신청', desc + ' 충전 신청에 실패했습니다.', ()=>{
                if ( this.cbEXIT != null ) {
                    this.cbEXIT();
                }
            });
        })
    }

    private onEDITBOX_RETURN( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        editbox.string = editbox.string.trim();

        let s = CommonUtil.getKoreanNumber( Number(editbox.string) );
        this.labelKorValue.string = s;
        this.labelKorValue.node.active = true;

    }

    private onEDITBOX_DID_BEGAN( editbox, customEventData ) {
        editbox.string = '';
    }

    private onEDITBOX_DID_ENDED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();

        let s = CommonUtil.getKoreanNumber( Number(editbox.string) );
        this.labelKorValue.string = s;
        this.labelKorValue.node.active = true;

    }

    private onEDITBOX_TEXT_CHANGED( editbox, customEventData ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        editbox.string = editbox.string.trim();

        let s = CommonUtil.getKoreanNumber( Number(editbox.string) );
        this.labelKorValue.string = s;
        this.labelKorValue.node.active = true;

    }
}

