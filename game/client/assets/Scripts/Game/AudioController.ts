import { _decorator, Component, Node, AudioSource, AudioClip } from 'cc';
import { ResourceManager } from '../ResourceManager';
import { NetworkManager } from '../NetworkManager';
import { VOLUMNE_MULTIPLIER } from '../HoldemDefines';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    static instance: AudioController;
    @property(AudioSource) audioSource: AudioSource = null;
    @property(AudioSource) audioSourceTimeLimitFourSec: AudioSource = null;

    private volumn: number = 0;

    init() {
        AudioController.instance = this;
        this.ApplyVolumn();
    }

    public ApplyVolumn() {
        let setting: any = null;
        setting = NetworkManager.Instance().GetSetting();
        if ( setting == null || setting == undefined ) {
            this.volumn = 5;
        } else {
            this.volumn = setting.sound;
        }
        this.audioSource.volume = this.volumn / VOLUMNE_MULTIPLIER;
        this.audioSourceTimeLimitFourSec.volume = this.volumn / VOLUMNE_MULTIPLIER;
    }

    public PlayTimeLimit() {
        this.audioSourceTimeLimitFourSec.play();
    }

    public StopTimeLimit() {
        this.audioSourceTimeLimitFourSec.stop();
    }

    PlaySound( name: string ) {
        let source: AudioClip = null;
        source = ResourceManager.Instance().getSoundSource(name);
        if ( source != null ) {
            this.audioSource.playOneShot(source);
        }
    }

    ButtonClick() {
        this.PlaySound('BUTTON_CLICK');
    }
}


