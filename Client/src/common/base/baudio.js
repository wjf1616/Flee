/**
 * Created by jfwang on 2017-07-27.
 * 声音处理类
 */
(function(){
var audioEngine = cc.audioEngine;

X.audio = {
    _musicPlaying: false
	//播放音乐
	,playMusic : function(file,ifLoop){
		if(!C.isJSB)return;
        this._musicPlaying = true;
		return audioEngine.playMusic(file, ifLoop||false);
	}
	//停止音乐
	,stopMusic : function(file){
		return audioEngine.stopMusic(file);
	}
	//暂停音乐
	,pauseMusic : function(){
        this._musicPlaying = false;
		return audioEngine.pauseMusic();
	}
	//继续音乐
	,resumeMusic : function(){
        this._musicPlaying = true;
		return audioEngine.resumeMusic();
	}
    ,pauseResumeMusic: function(){
        if (this._musicPlaying) this.pauseMusic();
        else this.resumeMusic();
    }
	//回放音乐
	,rewindMusic : function(){
		return audioEngine.rewindMusic();
	}
	//音乐是否播放中
	,isMusicPlaying : function(){
		return audioEngine.isMusicPlaying();
	}
	//获取声音音量
	,getMusicVolume : function(){
		return audioEngine.getMusicVolume();
	}
	//设置声音音量
	,setMusicVolume : function(value){
		return audioEngine.setMusicVolume(value);
	}
	//===================================
	//播放音效 返回soundId
	,playEffect : function(file,ifRepeat){
		if(!C.isJSB)return;
		//if(X.cache('playEffect')*1 === 0)return;
		return audioEngine.playEffect(file,ifRepeat||false);
	}
	//停止音效
	,stopEffect : function(soundId){
		if(soundId!=null)audioEngine.stopEffect(soundId);
	}
	//暂停音效
	,pauseEffect : function(soundId){
		audioEngine.pauseEffect(soundId);
	}
	//继续音效
	,resumeEffect : function(soundId){
		audioEngine.resumeEffect(soundId);
	}
	//暂停所有音效
	,pauseAllEffects : function(){
		audioEngine.pauseAllEffects();
	}
	//继续所有音效
	,resumeAllEffects : function(){
		audioEngine.resumeAllEffects();
	}
	//停止所有音效
	,stopAllEffects : function(){
		audioEngine.stopAllEffects();
	}
	//释放音效
	,unloadEffect : function(file){
		audioEngine.unloadEffect(file);
	}
	//获取音效音量
	,getEffectsVolume : function(){
		return audioEngine.getEffectsVolume();
	}
	//设置音效音量
	,setEffectsVolume : function(value){
		return audioEngine.setEffectsVolume(value);
	}
};

})();