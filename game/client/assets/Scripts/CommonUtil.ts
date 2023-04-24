import { _decorator, Component, resources, SpriteFrame, Sprite } from 'cc';
import { ResourceManager } from './ResourceManager';
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

    static getKoreanNumber(num: number): string {
        const koreanUnits = ['', '만', '억', '조'];
        let answer = '';
        let unit = 10000;
        let index = 0;
        let division = Math.pow(unit, index);
      
        while (Math.floor( num / division) > 0) {
          const mod = Math.floor(num % (division * unit) / division);
          if(mod) {
            const modToString = mod.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            answer = `${modToString}${koreanUnits[index]} `+ answer;
          }
          division = Math.pow(unit, ++index);
        }

        if ( answer.length == 0) {
            answer = '0';
        }

        return answer;
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

    static setCardSprite( type: number, number:number, sf: Sprite, cb: ()=>void = null ) {
        let url = 'Cards/' + 'type' + type.toString() + '/'+number.toString() + '/spriteFrame'

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


