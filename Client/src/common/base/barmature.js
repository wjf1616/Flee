/**
 * Created by jfwang on 2017-07-29.
 * 动画使用封装
 */
(function(){

X.armature = {
	/*
	sync 是否同步模式 默认为false-异步，
	web中强制异步模式
	 */
	create : function(exportJson,name,callback,sync){
		try{
			this.createWithTry(exportJson,name,callback,sync);
		}catch(e){
			G.getError && G.getError(e);
		}
	},
	
	createWithTry : function(exportJson,name,callback,sync){
		if(cc.sys.isNative){
			if(sync) {
				ccs.armatureDataManager.addArmatureFileInfo(exportJson);
				var node = new ccs.Armature(name);
				node.getAnimation().playWithIndex(0);
				callback && callback(node);
				return;
			}else{
				ccs.armatureDataManager.addArmatureFileInfoAsync(exportJson,function (percent) {
					if(percent>=1){
						var node = new ccs.Armature(name);
						node.getAnimation().playWithIndex(0);
						callback && callback(node);
						return;
					}
				},this);
			}
		}

		//预加载exportJson文件
		cc.loader.load(exportJson,function(err,res){
			if(err){
				var node = new cc.Node();
				cc.log(exportJson+' load error');
				callback && callback(node);
				return;
			}
			var folder = cc.path.dirname(exportJson);
			var plistAndPng = (res[0].config_file_path||[]).concat(res[0].config_png_path||[]);
			for(var i=0;i<plistAndPng.length;i++){
				plistAndPng[i] = (folder+'/'+plistAndPng[i]);
			}

			//预加载exportJson中使用到的plist文件和png文件
			cc.loader.load(plistAndPng,function(err,res){
				//创建骨骼动画
				ccs.armatureDataManager.addArmatureFileInfo(exportJson);
				var node = new ccs.Armature(name);
				node.getAnimation().playWithIndex(0);

				//骨骼动画回调事件
				node.onMovementEvent = function(fun){
					this._movementEventCallFunction = function(armature, movementType, movementID){
						fun && fun(armature, movementType, movementID);
					};
					this.getAnimation().setMovementEventCallFunc(this._movementEventCallFunction,this);
				};

				//骨骼动画帧事件回调
			    node.onFrameEvent = function(fun){
			        this._frameEventCallFunction = function(bone,event,originIndex,curIndex){
			            fun && fun(bone,event,originIndex,curIndex); 
			        };
			        this.getAnimation().setFrameEventCallFunc(this._frameEventCallFunction,this);
			    };

				callback && callback(node);
			});
		});
	},

	//通过exportJson文件移除缓存资源
	removeCache : function(exportJson){
		cc.log('removeCache',exportJson);
		ccs.armatureDataManager.removeArmatureFileInfo(exportJson);
	},

	//移除所以骨骼动画缓存资源
	removeAllCache : function(){
		ccs.armatureDataManager.clear();
	}
};
	
})();