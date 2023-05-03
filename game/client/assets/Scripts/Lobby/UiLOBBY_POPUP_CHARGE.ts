import { _decorator, Component, Node, Label, Button, EditBox, EventHandler } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { CommonUtil } from '../CommonUtil';
import { LobbySystemPopup } from '../LobbySystemPopup';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_CHARGE')
export class UiLOBBY_POPUP_CHARGE extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Label) labelHolder: Label = null;
    @property(Label) labelKorValue: Label = null;

    @property(EditBox) editboxChargeAmount: EditBox = null;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;

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

        this.buttonExit.node.off( 'click' );
        this.buttonExit.node.on( 'click', this.onEXIT.bind(this), this );

        this.buttonApply.node.off( 'click' );
        this.buttonApply.node.on( 'click', this.onAPPLY.bind(this), this );
    }

    public Show( button: Button ) {
        button.interactable = true;
        this.Reset();

        NetworkManager.Instance().reqGET_CHARGE_REQUEST_COUNT( ( res )=>{
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
        this.labelHolder.string = '';
        this.labelKorValue.string = '';
        this.labelKorValue.node.active = false;
    }

    private GetStoreInfo() {
        NetworkManager.Instance().reqGET_STORE( ( res: any )=>{
            let store = res.store;
            if ( store != null ) {
                this.labelHolder.string = store.holder;
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
        if ( num < 10000 ) {
            LobbySystemPopup.instance.showPopUpOk('충전 신청', ' 10000 이하는 신청할 수 없습니다.', ()=>{

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
        let desc = CommonUtil.getKoreanNumber(amount);
        NetworkManager.Instance().reqCHARGE_REQUEST( amount, (res)=>{
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

