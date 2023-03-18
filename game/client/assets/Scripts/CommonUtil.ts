import { _decorator, Component, resources, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CommonUtil')
export class CommonUtil {

    static setting: any = null;

    static getNumberStringWithComma(num: number, showCurrency: boolean = false): string {
        let currency: string;
        currency = "₩";
        let result = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        if (showCurrency == true) {
            return currency + result;

        } else {
            return result;
        }
    }

    static setAvatarSprite( type: number, sf: Sprite, cb: ()=>void = null ) {
        let url = `Avatar/avata_${type.toString()}/spriteFrame`;

        resources.load<SpriteFrame>( url, ( err, res ) => {
            sf.spriteFrame = res;
            //sf.sizeMode = 
            
            if (cb != null) {
                cb();
            }
        });
    }

    static setEmoticonSprite( type: number, sf: Sprite, cb: ()=>void = null ) {
        let url = `Emoticon/emoji_${type.toString()}/spriteFrame`;

        resources.load<SpriteFrame>( url, ( err, res ) => {
            sf.spriteFrame = res;
            if (cb != null) {
                cb();
            }
        });
    }    

    static setGameSetting( setting: any ) {
        CommonUtil.setting = {
            avatars: setting.avatars,
        }
    }

    static getGameSetting(): any {
        return CommonUtil.setting;
    }
}


