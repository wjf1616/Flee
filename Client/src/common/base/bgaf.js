/**
 * Created by jfwang on 2017-07-29.
 * gaf 封装
 */

(function(){

X.gaf = {
	create : function(file,conf){
		
		var node,asset = gaf.Asset.create(file);
		
		if(conf && conf.blend){
			node = asset.createObjectAndRunWithBlend(false,conf.blend[0],conf.blend[1]);
		}else{
			node = asset.createObjectAndRun(false);
			//node = asset.createObject();
		}
		node.runAni = function(name,loop){
			this.playSequence(name,loop!=null?loop:false);
			//this.start();
		};
		node.stopAni = function(){
			this.stop();
		};
		/*
		 node.stop
		 node.start
		 node.pauseAnimation
		 node.resumeAnimation
		*/
		node.onLooped = function(fun){
			this._loopDelegate = fun;
			this.setAnimationStartedNextLoopDelegate(function(){
				this._loopDelegate && this._loopDelegate.call(this);
			});
		};
		node.onFinished = function(fun){
			this._finishedDelegate = fun;
			this.setAnimationFinishedPlayDelegate(function(){
				var self = this;
				self.stop();
				self.setTimeout(function(){
					self._finishedDelegate.call(self);
				},1);
			});
		};
		
		return node;
	}
};
	
})();