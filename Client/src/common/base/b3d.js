/**
 * Created by jfwang on 2017-07-29.
 * 3D动画 封装
 */
(function(){

X.b3D = {
	create : function(file){
		if(!cc.sys.isNative){
			cc.log('only native support 3D file '+ file);
			var node = ccs.Node.create();
			node.aniData = node.getAni = node.runAni = node.stopAni = node.stopAllAni = function(){};
			return node;
		}
		
		var node = new jsb.Sprite3D(file);
		/*
		设置动作帧数据
		{
			rate:30, //30帧
			ani:{
					ani1:[fromFrame,toFrame],
					ani2:[fromFrame,toFrame],
				}
		}
		*/
		node._c3bFile = file;
		node.aniData = function(v){
			if(v==null){
				return this._aniData;	
			}else{
				this._aniData = v;
			}
		};
		
		node.getAni = function(v){
			var Animation3D = jsb.Animation3D.create(this._c3bFile);
			if(v==null) return jsb.Animate3D.create(Animation3D);
			
			var aniData = this.aniData();
			if(aniData==null){
				cc.log('runAni ['+ v +'] error,aniData is null');
				return;	
			}
			if(aniData['ani'][v]==null){
				cc.log('runAni ['+ v +'] error, the ani not in aniData');
				return;	
			}
			if(!Animation3D){
				cc.log('runAni ['+ v +'] error, Animation3D is null,file='+ this._c3bFile);
				return;		
			}
			
			var oneFrameTime = 1/aniData.rate;
			var _s = oneFrameTime*aniData['ani'][v][0];
			var _e = oneFrameTime*aniData['ani'][v][1];
			
			var animate = jsb.Animate3D.create(Animation3D , _s , _e - _s );
			return animate;
		};
		
		node.runAni = function(v){
			var ani = this.getAni(v);
			node.runAction(new cc.RepeatForever(ani));
		};
		
		node.stopAni = function(){
				
		};
		node.stopAllAni = function(){
			
		};
	
		return node;
	}
};
	
})();