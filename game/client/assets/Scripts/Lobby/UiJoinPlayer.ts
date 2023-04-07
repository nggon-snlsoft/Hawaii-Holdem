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
    @property(Button) buttonIDCheck: Button = null;

    @property (EditBox) editBoxNickname: EditBox = null;
    @property(Button) buttonNicknameCheck: Button = null;

    @property (EditBox) editBoxPassword: EditBox = null;
    @property (EditBox) editBoxPasswordConfirm: EditBox = null;
    @property (EditBox) editBoxTransferPassword: EditBox = null;
    @property (EditBox) editBoxPhone: EditBox = null;
    @property (EditBox) editBoxBank: EditBox = null;
    @property (EditBox) editBoxHolder: EditBox = null;
    @property (EditBox) editBoxAccount: EditBox = null;
    @property (EditBox) editBoxRecommender: EditBox = null;

    private main: Main = null;

    private isCheckID = false;
    private isCheckNickname = false;    

    init( main: Main ) {
        if ( main != null ) {
            this.main = main;
        }

        this.buttonJoin.node.on('click', this.onClickJoin.bind(this));
        this.buttonCancel.node.on('click', this.onClickCancel.bind(this));

        this.buttonIDCheck.node.on('click', this.onClickIDCheck.bind(this));
        this.buttonNicknameCheck.node.on('click', this.onClickNicknameCheck.bind(this));

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

    onClickJoin( button: Button ) {
        button.interactable = false;

        let isValid = this.validate();
        if ( isValid == true ) {
            LoginSystemPopup.instance.showPopUpYesOrNo('회원가입', '회원가입을 신청 하겠습니까? \n', ()=>{
                NetworkManager.Instance().reqJoinMember({
                    uid: this.editBoxID.string,
                    nickname: this.editBoxNickname.string,                        
                    password: this.editBoxPassword.string,
                    trans: this.editBoxTransferPassword.string,
                    phone: this.editBoxPhone.string,
                    bank: this.editBoxBank.string,
                    holder: this.editBoxHolder.string,
                    account: this.editBoxAccount.string,
                    recommender: this.editBoxRecommender.string,
        
                }, (res)=>{
                    button.interactable = true;

                    if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                        LoginSystemPopup.instance.showPopUpOk('회원가입', '가입신청이 완료되었습니다.', ()=>{
                            LoginSystemPopup.instance.closePopup();

                            this.main.onShowLogin();
                        });
        
                    } else {
                        let desc: string = '';
        
                        switch(res.msg) {
                            case 'INVALID_UID':
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
                            default:
        
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
                LoginSystemPopup.instance.closePopup();
            });
        }
        else {
            button.interactable = true;            
        }
    }

    onClickCancel( button: Button ) {        
        this.main.onShowLogin();
    }

    onClickIDCheck( button: Button ) {
        button.interactable = false;
        NetworkManager.Instance().reqCheckUID( this.editBoxID.string, (res)=>{
            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 있는 아이디 입니다.', ()=>{
                    this.isCheckID = true;
                    button.interactable = true;                            
                    LoginSystemPopup.instance.closePopup();
                });
            } else {
                LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 없는 아이디 입니다.', ()=>{
                    this.editBoxID.string = '';
                    this.isCheckID = false;
                    button.interactable = true;
                    LoginSystemPopup.instance.closePopup();
                });
            }
        }, (err)=>{
            LoginSystemPopup.instance.showPopUpOk('회원가입', '아이디 확인에 실패했습니다.', ()=>{
                this.isCheckID = false;
                button.interactable = true;
                LoginSystemPopup.instance.closePopup();
            });            
        });
    }

    onClickNicknameCheck( button: Button ) {
        button.interactable = false;
        NetworkManager.Instance().reqCheckNickname( this.editBoxNickname.string, (res)=>{
            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 있는 닉네임 입니다.', ()=>{
                    this.isCheckNickname = true;
                    button.interactable = true;                            
                    LoginSystemPopup.instance.closePopup();
                });
            } else {
                LoginSystemPopup.instance.showPopUpOk('회원가입', '사용할 수 없는 닉네임 입니다.', ()=>{
                    this.editBoxNickname.string = '';
                    this.isCheckNickname = false;
                    button.interactable = true;
                    LoginSystemPopup.instance.closePopup();
                });
            }
        }, (err)=>{
            LoginSystemPopup.instance.showPopUpOk('회원가입', '닉네임 확인에 실패했습니다.', ()=>{
                this.isCheckNickname = false;
                button.interactable = true;
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

        // if ( this.isCheckID == false ) {
        //     LoginSystemPopup.instance.showPopUpOk('회원가입', '아이디 중복체크 해주세요.', ()=>{
        //         LoginSystemPopup.instance.closePopup();
        //     });
        //     return false;
        // }

        if ( this.validateNickname() != true ) {
            LoginSystemPopup.instance.showPopUpOk('회원가입', '잘못된 닉네임 형식 입니다. ( 4~10자 영문/숫자/한글만 )', ()=>{
                this.editBoxNickname.string = '';
                LoginSystemPopup.instance.closePopup();
            });
            return false;
        }

        // if ( this.isCheckNickname == false ) {
        //     LoginSystemPopup.instance.showPopUpOk('회원가입', '닉네임 중복체크 해주세요.', ()=>{
        //         LoginSystemPopup.instance.closePopup();
        //     });
        //     return false;
        // }


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

        if ( l >= 4 &&  l <= 15 ) {
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

        if ( l >= 4 &&  l <= 15 ) {
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

        if ( l >= 10 &&  l <= 15 ) {
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

        if ( l < 3 ) {
            return false;
        } 
        return true;
    }

    validateHolder(): boolean {
        let l = this.editBoxHolder.string.length;

        if ( l < 1 ) {
            return false;
        } 
        return true;
    }

    validateAccount(): boolean {
        let l = this.editBoxAccount.string.length;

        if ( l >= 10 &&  l <= 20 ) {
            let regex1 = /^[a-zA-Z0-9]*$/;
            let regex2 = /^\d{2,3}-\d{3,4}-\d{4}$/;

            let c1 = regex1.test(this.editBoxAccount.string);
            let c2 = regex2.test(this.editBoxAccount.string);
            
            if ( c1 != true && c2 != true) {
                return false;
            } 
        } else {
            return false;
        }
        return true;
    }

    validateRecommender(): boolean {
        let l = this.editBoxRecommender.string.length;

        if ( l >= 4 &&  l <= 20 ) {
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
}


