/**
 * Created by jfwang on 2017-07-29.
 * spine封装
 */

(function(){

X.spine = {
	create : function(json,atlas,scale){
		if (!scale) scale = 1;
		var node = sp.SkeletonAnimation.create(json, atlas, scale);

		node.runAni = function(trackIndex,name,loop){
			node.setAnimation(trackIndex,name,loop)
		};
		node.addAni = function(trackIndex,name,loop){
			node.addAnimation(trackIndex,name,loop)
		};
		
		node.stopAni = function(trackIndex){
			node.clearTrack(trackIndex);
		};
		
		node.stopAllAni = function(trackIndex){
			node.clearTracks();
		};
		
		node.onStart = function(fun){
			this._startDelegate = fun;
			this.setStartListener(function(traceIndex){
	            this._startDelegate && this._startDelegate(traceIndex);
	        });
		};

		node.onLooped = function(fun){
			this._loopDelegate = fun;
			this.setEndListener(function(traceIndex){
	            this._loopDelegate && this._loopDelegate(traceIndex);
	        });
		};
		
		node.onFinished = function(fun){
			this._finishedDelegate = fun;
			this.setCompleteListener(function(traceIndex, loopCount){
	            this._finishedDelegate && this._finishedDelegate(traceIndex, loopCount);
	        });
		};
		
		node.onEvent = function(fun){
			this._eventDelegate = fun;
			this.setEventListener(function(traceIndex, event){
	            this._eventDelegate && this._eventDelegate(traceIndex, event);
	        });
		};
		
		return node;
	}
};
	
})();