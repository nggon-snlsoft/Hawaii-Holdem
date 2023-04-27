import { _decorator, Component, Node, AudioSource, AudioClip } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { VOLUMNE_MULTIPLIER } from '../HoldemDefines';
const { ccclass, property } = _decorator;

@ccclass('LobbyAudioContoller')
export class LobbyAudioContoller extends Component {
    static instance: LobbyAudioContoller = null ;
    @property(AudioClip) clipButtonClick: AudioClip = null;

    @property(AudioSource) audioSource: AudioSource = null;

    private volumn: number = 0;

    init() {
        LobbyAudioContoller.instance = this;

        this.volumn = NetworkManager.Instance().getUserSetting().sound;
        this.audioSource.volume = this.volumn / VOLUMNE_MULTIPLIER;
    }

    ApplyVolumn() {
        this.volumn = NetworkManager.Instance().getUserSetting().sound;
        this.audioSource.volume = this.volumn / VOLUMNE_MULTIPLIER;
    }

    PlayButtonClick() {
        console.log('playButtonClick');
        this.audioSource.playOneShot( this.clipButtonClick );        
    }
}


