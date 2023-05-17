import { _decorator, Component, Node, Button, EditBox } from 'cc';
import { LobbySystemPopup } from '../LobbySystemPopup';
import { LoginSystemPopup } from '../Login/LoginSystemPopup';
import { Main } from '../Main';
import { ENUM_RESULT_CODE, NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('UiJoinPlayer')
export class UiJoinPlayer extends Component {
    @property(Button) buttonJoin: Button = null;
    @property(Button) buttonCancel: Button = null;

    @property (EditBox) editBoxID: EditBox = null;
    @property (EditBox) editBoxNickname: EditBox = null;    
    @property (EditBox) editBoxPassword: EditBox = null;
    @property (EditBox) editBoxPasswordConfirm: EditBox = null;
    @property (EditBox) editBoxTransferPassword: EditBox = null;
    @property (EditBox) editBoxPhone: EditBox = null;
    @property (EditBox) editBoxBank: EditBox = null;
    @property (EditBox) editBoxHolder: EditBox = null;
    @property (EditBox) editBoxAccount: EditBox = null;
    @property (EditBox) editBoxRecommender: EditBox = null;

    @property(Button) buttonIDCheck: Button = null;
    @property(Button) buttonNicknameCheck: Button = null;

    private main: Main = null;

    private isCheckID = false;
    private isCheckNickname = false;    

    init( main: Main ) {
        if ( main != null ) {
            this.main = main;
        }

        this.buttonJoin.node.on('click', this.onCLICK_JOIN.bind(this));
        this.buttonCancel.node.on('click', this.onCLICK_CANCEL.bind(this));

        this.buttonIDCheck.node.on('click', this.onCLICK_CHECK_ID.bind(this));
        this.buttonNicknameCheck.node.on('click', this.onCLICK_CHECK_NICKNAME.bind(this));

        this.editBoxID.node.on('editing-did-began', this.onLOGIN_ID_EDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxID.node.on('editing-return', this.onLOGIN_ID_EDITBOX_RETURN.bind(this), this);
        this.editBoxID.node.on('text-changed', this.onLOGIN_ID_EDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxID.node.on('editing-did-ended', this.onLOGIN_ID_EDITBOX_DID_ENDED.bind(this), this);

        this.editBoxNickname.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxNickname.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxNickname.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxNickname.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxPassword.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxPassword.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxPassword.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxPassword.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxPasswordConfirm.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxPasswordConfirm.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxPasswordConfirm.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxPasswordConfirm.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxTransferPassword.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxTransferPassword.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxTransferPassword.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxTransferPassword.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxPhone.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxPhone.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxPhone.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxPhone.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxBank.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxBank.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxBank.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxBank.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxHolder.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxHolder.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxHolder.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxHolder.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxAccount.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxAccount.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxAccount.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxAccount.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.editBoxRecommender.node.on('editing-did-began', this.onEDITBOX_DID_BEGAN.bind(this), this);
        this.editBoxRecommender.node.on('editing-return', this.onEDITBOX_RETURN.bind(this), this);
        this.editBoxRecommender.node.on('text-changed', this.onEDITBOX_TEXT_CHANGED.bind(this), this);
        this.editBoxRecommender.node.on('editing-did-ended', this.onEDITBOX_DID_ENDED.bind(this), this);

        this.node.active = false;
    }

    hide() {
        this.node.active = false;
    }

    show() {
        this.buttonJoin.interactable = true;
        this.buttonCancel.interactable = true;
        this.buttonIDCheck.interactable = true;
        this.buttonNicknameCheck.interactable = true;

        this.editBoxID.string = '';
        this.editBoxNickname.string = '';
        this.editBoxPassword.string = '';
        this.editBoxPasswordConfirm.string = '';
        this.editBoxTransferPassword.string = '';
        this.editBoxPhone.string = '';
        this.editBoxBank.string = '';
        this.editBoxHolder.string = '';
        this.editBoxAccount.string = '';
        this.editBoxRecommender.string = '';

        this.node.active = true;
    }

    onCLICK_JOIN( button: Button ) {
        button.interactable = false;

        let isValid = this.validate();
        if ( isValid == true ) {
            LoginSystemPopup.instance.showPopUpYesOrNo('회원가입', '회원가입을 신청 하겠습니까? \n', ()=>{
                button.interactable = true;

                let store_code: string = this.editBoxRecommender.string.trim();
                store_code = store_code.toLowerCase();

                NetworkManager.Instance().reqJOIN_MEMBER( {
                    login_id: this.editBoxID.string,
                    store_id: 0,
                    nickname: this.editBoxNickname.string,                        
                    password: this.editBoxPassword.string,
                    transfer_password: this.editBoxTransferPassword.string,
                    phone: this.editBoxPhone.string,
                    bank: this.editBoxBank.string,
                    holder: this.editBoxHolder.string,
                    account: this.editBoxAccount.string,
                    recommender: store_code,
        
                }, (res)=>{
                    button.interactable = true;

                    if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                        LoginSystemPopup.instance.showPopUpOk('회원가입', '가입신청이 완료되었습니다.', ()=>{
                            LoginSystemPopup.instance.closePopup();

                            this.main.onShowLogin();
                        });
        
                    } else {
                        console.log( res.msg );

                        let desc: string = '';
                        switch(res.msg) {
                            case 'INVALID_UID':
                            case 'INVALID_LOGIN_ID':
                                desc = '아이디가 형식에 맞지 않습니다.';
                                break;
                            case 'INVALID_FORM':
                                desc = '모든칸을 입력해주세요';
                            break;
                            case 'DUPLICATE_UID':
                                desc = '중복된 아이디가 있습니다.';
                                break;
                            case 'DUPLICATE_NICKNAME':
                                desc = '중복된 닉네임이 있습니다.'
                            break;

                            case 'DUPLICATE_NICKNAME':
                                desc = '중복된 닉네임이 있습니다.'
                            break;
                            case 'INVALID_REFERAL_CODE':
                                desc = '추천코드가 잘못됐습니다.'
                            break;
                            
                            default:
                                desc = '가입신청이 실패했습니다';
                        }
        
                        LoginSystemPopup.instance.showPopUpOk('회원가입', desc, ()=>{
                            LoginSystemPopup.instance.closePopup();
                        });
                    }
                }, (err)=>{
                    LoginSystemPopup.instance.showPopUpOk('회원가입', '가입신청이 실패했습니다..', ()=>{
                        LoginSystemPopup.instance.closePopup();
                    });
                });
            }, ()=>{
                button.interactable = true;                
                LoginSystemPopup.instance.closePopup();
            });
        }
        else {
            button.interactable = true;
        }
    }

    onCLICK_CANCEL( button: Button ) {        
        this.main.onShowLogin();
    }

    onCLICK_CHECK_ID( button: Button ) {
        button.interactable = false;

        if ( this.validateID() == false ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '아이디 형식이 잘못됐습니다.\n숫자, 영어 4~10자', ()=>{
                this.isCheckID = true;
                button.interactable = true;                            
                LoginSystemPopup.instance.closePopup();
            });
            return;
        }

        NetworkManager.Instance().reqCHECK_LOGIN_ID( this.editBoxID.string, (res)=>{
            button.interactable = true;
            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 있는 아이디 입니다.', ()=>{
                    this.isCheckID = true;
                    button.interactable = true;                            
                    LoginSystemPopup.instance.closePopup();
                });
            } else {
                if ( res.msg == 'DUPLICATE_USERS' || res.msg == 'DUPLICATE_JOIN_USERS') {
                    LoginSystemPopup.instance.showPopUpOk('회원가입', '중복된 아이디가 있습니다.', ()=>{
                        this.editBoxID.string = '';
                        this.isCheckID = false;

                        LoginSystemPopup.instance.closePopup();
                    });
                } else {
                    LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 없는 아이디 입니다.', ()=>{
                        this.editBoxID.string = '';
                        this.isCheckID = false;

                        LoginSystemPopup.instance.closePopup();
                    });
    
                }
            }
        }, (err)=>{
            button.interactable = true;
            LoginSystemPopup.instance.showPopUpOk('회원가입', '아이디 확인에 실패했습니다.', ()=>{
                this.isCheckID = false;
                button.interactable = true;
                LoginSystemPopup.instance.closePopup();
            });            
        });
    }

    private onCLICK_CHECK_NICKNAME( button: Button ) {
        button.interactable = false;

        if ( this.validateNickname() == false ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '닉네임 형식이 잘못됐습니다.\n숫자, 영어 4~10자', ()=>{
                this.isCheckID = true;
                button.interactable = true;                            
                LoginSystemPopup.instance.closePopup();
            });
            return;
        }        

        NetworkManager.Instance().reqCHECK_NICKNAME( this.editBoxNickname.string, (res)=>{
            button.interactable = true;

            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 있는 닉네임 입니다.', ()=>{
                    this.isCheckNickname = true;
                    button.interactable = true;                            
                    LoginSystemPopup.instance.closePopup();
                });
            } else {
                if ( res.msg == 'DUPLICATE_USERS' || res.msg == 'DUPLICATE_JOIN_USERS') {
                    LoginSystemPopup.instance.showPopUpOk('회원가입', '중복된 닉네임이 있습니다.', ()=>{
                        this.editBoxNickname.string = '';
                        this.isCheckNickname = true;

                        LoginSystemPopup.instance.closePopup();
                    });
                } else {
                    LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 없는 닉네임 입니다.', ()=>{
                        this.editBoxNickname.string = '';
                        this.isCheckNickname = false;

                        LoginSystemPopup.instance.closePopup();
                    });    
                }
            }
        }, (err)=>{
            button.interactable = true;

            LoginSystemPopup.instance.showPopUpOk('회원가입', '닉네임 확인에 실패했습니다.', ()=>{
                this.isCheckNickname = false;
                LoginSystemPopup.instance.closePopup();
            });            
        });

    }

    validate(): boolean {
        if ( this.validateID() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '잘못된 아이디 형식 입니다. ( 4~10자 영문/숫자만 )', ()=>{
                this.editBoxID.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        if ( this.validateNickname() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '잘못된 닉네임 형식 입니다. ( 4~10자 영문/숫자/한글만 )', ()=>{
                this.editBoxNickname.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        if ( this.validatePassword() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '잘못된 비밀번호 형식 입니다. ( 4~15자 영문/숫자만 )', ()=>{
                this.editBoxPassword.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        let l1: string = this.editBoxPassword.string;
        let l2: string = this.editBoxPasswordConfirm.string;

        if ( l1 != l2 ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '비밀번호 확인이 잘못되었습니다.', ()=>{
                this.editBoxPasswordConfirm.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;            
        }

        if ( this.validateTransferPassword() != true ) {
            this.editBoxTransferPassword.string = '';
            LoginSystemPopup.instance.showPopUpOk('회원가입', '잘못된 환전 비밀번호 형식 입니다. ( 4~15자 영문/숫자만 )', ()=>{
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        if ( this.validatePhone() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '전화번호를 입력해 주세요.', ()=>{
                this.editBoxPhone.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        if ( this.validateBank() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '은행을 입력해주세요.', ()=>{
                this.editBoxBank.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        if ( this.validateHolder() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '예금주를 입력해주세요.', ()=>{
                this.editBoxHolder.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        if ( this.validateAccount() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '계좌 번호를 입력주세요.', ()=>{
                this.editBoxAccount.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        if ( this.validateRecommender() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '추천인 코드를 입력주세요.', ()=>{
                this.editBoxRecommender.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }
        
        return true;
    }

    validateID(): boolean {
        let l = this.editBoxID.string.length;

        if ( l >= 4 &&  l <= 10 ) {
            let reg = /^[a-zA-Z0-9]*$/;
            let c = reg.test(this.editBoxID.string);
            if ( c != true ) {
                return false;
            } 
        } else {
            return false;
        }
        return true;
    }

    validateNickname(): boolean {
        let l = this.editBoxNickname.string.length;

        if ( l >= 4 &&  l <= 10 ) {
            const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/;
            let c = regex.test(this.editBoxNickname.string);
            if ( c != true ) {
                return false;
            } 
        } else {
            return false;
        }
        return true;
    }

    validatePassword(): boolean {
        let l = this.editBoxPassword.string.length;

        if ( l >= 4 &&  l <= 12 ) {
            let regex = /^[a-zA-Z0-9]*$/;
            let c = regex.test(this.editBoxPassword.string);
            if ( c != true ) {
                return false;
            } 
        } else {
            return false;
        }
        return true;
    }

    validateTransferPassword(): boolean {
        let l = this.editBoxTransferPassword.string.length;

        if ( l >= 4 &&  l <= 12 ) {
            let regex = /^[a-zA-Z0-9]*$/;
            let c = regex.test(this.editBoxTransferPassword.string);
            if ( c != true ) {
                return false;
            } 
        } else {
            return false;
        }
        return true;
    }

    validatePhone(): boolean {
        let l = this.editBoxPhone.string.length;

        if ( l >= 5 ) {
            let regex1 = /^[a-zA-Z0-9]*$/;
            let regex2 = /^\d{2,3}-\d{3,4}-\d{4}$/;
            let c1 = regex1.test(this.editBoxPhone.string);
            let c2 = regex2.test(this.editBoxPhone.string);
            
            if ( c1 != true && c2 != true) {
                return false;
            } 
        } else {
            return false;            
        }
        return true;
    }

    validateBank(): boolean {
        let l = this.editBoxBank.string.length;

        if ( l >= 2 ) {
            return true;
        } else {
            return false;
        }
    }

    validateHolder(): boolean {
        let l = this.editBoxHolder.string.length;

        if ( l >= 2 ) {
            return true;
        } 
        return false;
    }

    validateAccount(): boolean {
        let l = this.editBoxAccount.string.length;

        if ( l >= 5 ) {
            let regex1 = /^[a-zA-Z0-9]*$/;
            let regex2 = /^\d{2,3}-\d{3,4}-\d{4}$/;

            let c1 = regex1.test(this.editBoxAccount.string);
            let c2 = regex2.test(this.editBoxAccount.string);

            if ( c1 != true && c2 != true) {
                return false;
            }             
        }
        else {
            return false;
        }
        return true;
    }

    validateRecommender(): boolean {
        let l = this.editBoxRecommender.string.length;

        if ( l >= 4 ) {
            let regex = /^[a-zA-Z0-9]*$/;

            let c = regex.test(this.editBoxRecommender.string);
            
            if ( c != true ) {
                return false;
            } 
        } else {
            return false;
        }
        return true;
    }

    private onLOGIN_ID_EDITBOX_DID_BEGAN( editbox ) {
        editbox.string = '';
        console.log('onEDITBOX_DID_BEGAN');
    }    

    private onLOGIN_ID_EDITBOX_RETURN( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
        editbox.string = editbox.string.toLowerCase();
    }

    private onLOGIN_ID_EDITBOX_DID_ENDED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
        editbox.string = editbox.string.toLowerCase();        
    }

    private onLOGIN_ID_EDITBOX_TEXT_CHANGED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        let c = '\t';
        if ( editbox.string.includes(c) == true ) {
            editbox.blur();
        }

        editbox.string = editbox.string.trim();
        editbox.string = editbox.string.toLowerCase();
    }

    private onEDITBOX_DID_BEGAN( editbox ) {
        editbox.string = '';
    }    

    private onEDITBOX_RETURN( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
    }

    private onEDITBOX_DID_ENDED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }
        editbox.string = editbox.string.trim();
    }

    private onEDITBOX_TEXT_CHANGED( editbox ) {
        if ( editbox.string.length == 0 ) {
            return;
        }

        let c = '\t';
        if ( editbox.string.includes(c) == true ) {
            editbox.blur();
        }

        editbox.string = editbox.string.trim();
    }
}


