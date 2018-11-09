/**
 * Created by jfwang on 2017-07-26.
 * ui 基类
 */
(function(){
	/*
	 每个UI会广播以下事件
	 open = 即将打开
	 willshow = 即将显示
	 show = 显示完成
	 focus = 获取焦点
	 blur = 失去焦点
	 close = 被关闭
	 hide = 被隐藏

	 可通过 ui.on|once('open',function(){
	 do someting..
	 })
	 来绑定监听事件


	 UI 可选属性
	 singleGroup = 'string' 互斥组，同组ui只会存在一个
	 modalFrame = booler 是否模态窗口，是的话将永远居于frame之上，默认false
	 cacheFrame = booler 是否缓存窗口，是的话，在调用hide时，不会remove，默认false
	 */


	//获取最大zorder
	function getMaxZ(){
		var z=[0];
		for(var k in G.openingFrame){
			if(G.frame[k] && G.frame[k].ui){
				z.push(G.frame[k].ui.logicZindex || G.frame[k].ui.zIndex);
			}
		}
		var maxz = Math.max.apply(null,z);
		//if(maxz>49) maxz=49;
		return maxz;
	}

    X.getMaxZOrder = getMaxZ;
	X.topFrameID = null;
	var modalZindex = 90000;

	//检测窗口是否处于最上方
	function checkOnTopFun(topFrameID){
		var z=0,frameid;
		//获取当前最顶层的frameID
		if(topFrameID!=null && topFrameID!=""){
			frameid = topFrameID;
		}else{
			for(var k in G.openingFrame){
				if(G.openingFrame[k] > z){
					z = G.openingFrame[k];
					frameid = k;
				}
			}
		}
		var showedFrame = [];
		if(frameid && G.frame[frameid]) {
			X.topFrameID = frameid;
			G.frame[frameid].isTop = true;
			G.frame[frameid].isShow && G.frame[frameid].emit('focus');
		}

		for(var k in G.openingFrame){
			if(frameid != k && G.frame[k]){
				G.frame[k].emit('blur');
				G.frame[k].isTop = false;
			}
		}
	}

	//当前显示中的frame
	function freshShowedFrame(t){
		var showedFrame=[];
		for(var k in G.openingFrame){
			if(G.frame[k].isShow){
				showedFrame.push(k);
			}
		}
		G.event.emit('frameChange', showedFrame);
		//var scene = X.window.scene();
		//if(scene.__changeTimer){
		//	scene.clearTimeout(scene.__changeTimer);
		//	delete scene.__changeTimer;
		//}
		//scene.__changeTimer = scene.setTimeout(function() {
		//	G.event.emit('frameChange', showedFrame);
		//},5);
		return showedFrame;
	}

	//添加frame
	X.addFrame = function(id,frame){
		G.frame[id] = frame;
	};

	//清除所有frame
	X.destroyAllFrame = function(){
		for(var k in G.frame){
			delete G.frame[k];
		}
	};

	//关闭所有Frame
	X.closeAllFrame = function(clearEvent){
		for(var k in G.openingFrame){
			if(clearEvent){
				G.frame[k].event && G.frame[k].event.removeAllListeners && G.frame[k].event.removeAllListeners();
			}
			G.frame[k].remove();
		}
	};
	
	//隐藏所有frame
	/*
	 {
	 singleGroup : 关闭指定组
	 except 除了指定的这个key
	}
	* */
	X.hideAllFrame = function(conf){
		for(var k in G.openingFrame){
			if( conf && conf.except && (','+conf.except+',').indexOf(','+ k +',') != -1 ){
				continue;
			}else if(conf && conf.singleGroup && G.frame[k].singleGroup!=conf.singleGroup){
				continue;
			}
			G.frame[k].hide();
		}
	};

	X.bUi = cc.Class.extend({
		ctor: function(json,id){
			this._json = json;
			this._id = id;
			this._attr = {}; //frame永久属性，不会因为remove被清理
			G.openingFrame = G.openingFrame || {};
			this.event = cc.EventEmitter.create();
			this.event.setMaxListeners(200);
		},
		ID : function(){
			return this._id;
		},
		attr : function(k,v){
			if(v==null){
				return this._attr[k];
			}else if(v=="DELETE") {
				delete this._attr[k];
				return this;
			}else{
				this._attr[k] = v;
				return this;
			}
		},
		autoReleaseRes : function(jsonName){
			//简单释放资源，按照约定，frame用到的资源是 json同名的plist和png，这里只释放这2个资源，其他的需要手动处理
			//如果资源多于一张，则 json+1，json+2 ... 理论上不会超过3张，so，循环3次
			var me = this;
			if(jsonName==null)jsonName=this._json;

			for(var i=0;i<3;i++){
				var _index = i==0?"":i;
				//如果纹理存在
				var oplist = cc.path.changeExtname(jsonName,_index+'.plist');
				var opng = cc.path.changeExtname(jsonName,_index+'.png');
				
				if(cc.textureCache.getTextureForKey(opng)){
					cc.log('release='+oplist);
					cc.spriteFrameCache.removeSpriteFramesFromFile(oplist);
					cc.textureCache.removeTextureForKey(opng);
				}

				//fix..UI有可能加了 plist_name 和 Plist_name 2种纹理名
				var plist = 'plist_'+oplist;
				var png = 'plist_'+opng;
				if(cc.textureCache.getTextureForKey(png)){
					cc.log('release='+plist);
					cc.spriteFrameCache.removeSpriteFramesFromFile(plist);
					cc.textureCache.removeTextureForKey(png);
				}

				var plist = 'Plist_'+oplist;
				var png = 'Plist_'+opng;
				if(cc.textureCache.getTextureForKey(png)){
					cc.log('release='+plist);
					cc.spriteFrameCache.removeSpriteFramesFromFile(plist);
					cc.textureCache.removeTextureForKey(png);
				}
			}

			cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS && cc.textureCache.getCachedTextureInfo && console . log(cc.textureCache.getCachedTextureInfo());
		},
		releaseRes : function(res){
			//手动释放资源
			cc.each(res,function(v){
				var extName = cc.path.extname(v);
				if(extName=='.png'){
					cc.textureCache.removeTextureForKey(v);
				}else if(extName=='.plist'){
					cc.spriteFrameCache.removeSpriteFramesFromFile(v);
				}
			});
			cc.sys.isNative && cc.sys.os== cc.sys.OS_WINDOWS && cc.textureCache.getCachedTextureInfo && console . log(cc.textureCache.getCachedTextureInfo());
		},
		//设置父窗口ID
		parent : function(id){
			this._parent = id;
			return this;
		},
		getParent : function(){
			return this._parent;
		},
		setParentVisible : function(v){
			if(this._parent && G.frame[this._parent]){
				G.frame[this._parent].visible(v);
			}
		},
		//预准备
		prepare : function(finishCallback,progCallback){
			var me = this;

			me.preloadJSON(function(){
				me._prepareLoader = X.ccsload(this._json);
				me.ui = me._prepareLoader.node;
				me.action = me._prepareLoader.action;
				me.ui.retain();
				me.action && me.action.retain();
				me._prepared = true;
				me.onPrepare && me.onPrepare();
				finishCallback && finishCallback.call(me);
			},function(n,m){
				progCallback && progCallback(n,m);
			});
			
		},
		//可见性，仅设置可见性，不调用onshow onHide等方法
		visible : function(v){
			this.ui && this.ui.setVisible(v);
		},
		//预加载所需的JSON
		preloadJSON : function(finishCallback,progCallback){
			var me = this;
			if(cc.sys.isNative){
				return finishCallback && finishCallback.call(me);
			}

			var json = me._json;
			var res=[];
			if(me.preLoadRes) res = res.concat(me.preLoadRes);
			cc.loader.load(json,function (result, count, loadedCount) {
				if(
					result && result.Content && result.Content.Content
					&& result.Content.Content.UsedResources
					&& result.Content.Content.UsedResources.length>0
				){
					res = res.concat(result.Content.Content.UsedResources);
				}

				var resLen = res.length+1;
				progCallback && progCallback(1,resLen);

				if(res.length>0){
					me.preloadUsedResources(res,finishCallback,function(loadedCount,count){
						//json文件是第一个，所以这里loadedCount需要+2，count+1
						progCallback && progCallback(loadedCount+2,count+1);
					});
				}else{
					finishCallback && finishCallback.call(me);
				}

			},function(){

			});
		},
		//预加载用到的资源
		preloadUsedResources : function(list,finishCallback,progCallback){
			var me = this;
			cc.loader.load(list,function (result, count, loadedCount) {
				//cc.log(loadedCount,count,result);
				progCallback && progCallback(loadedCount,count);
			},function(){
				finishCallback && finishCallback.call(me);
			});
		},
		//外接数据
		data : function(d){
			if(d!=null){
				this._extData = d;
				return this;
			}else{
				return this._extData;
			}
		},
		setCache : function(key,timeTo){
			var me = this;
			me.__cacheData = me.__cacheData || {};
			if(timeTo=='1d'){
				//跨天
				var tomorrowS= G.time*1000+1000*60*60*24; //24小时后的微秒
				var tomorrow = new Date();
				tomorrow.setTime(tomorrowS);

				var y = tomorrow.getFullYear(),
					m = tomorrow.getMonth()+1,//获取当前月份的日期
					d = tomorrow.getDate();

				var timeStr = y+'/'+m+'/'+d+" 00:00:00",
					_time = X.str2Date(timeStr);
				me.__cacheData[key] = parseInt(_time.getTime()/1000);

			}else if(!isNaN(timeTo) && timeTo.toString().length==10){
				//如果是时间戳，则缓存到
				me.__cacheData[key] = timeTo*1;
			}else if(!isNaN(timeTo)){
				//其他数字，表示缓存到当前+timeTo秒
				me.__cacheData[key] = G.time*1 + timeTo*1;
			}else{
				cc.log('setCache timeTo error');
			}
		},
		_checkCache : function(){
			var me = this;
			me.__cacheData = me.__cacheData || {};
			for(var k in me.__cacheData){
				if(me.__cacheData[k] < G.time){
                    var ks = k.split('.');
                    var d = me;
                    for (var i = 0; i < ks.length; i++){
                        if (i == ks.length - 1){
                            delete d[ks[i]];
                        }else{
                            d = d[ks[i]];
                        }
                    }
				}
			}
		},
		dumpUI : function(root,db){
			var me = this;

			var ifRoot = false;
			me.__dumpIndex = me.__dumpIndex || 1;

			if(db==null){
				db = me.__dumpInfo = {};
			}
			if (root==null){
				root=me.ui;
				ifRoot = true;
			}
			if(!root){
				cc.log('dumpUI error');
				return;
			}
			var children = root.getChildren(),
				length = children.length;
			for (var i = 0; i < length; i++) {
				var child = children[i];

				var _key,
					_name = (child.getName?child.getName():null),
					_tag =  (child.getTag?child.getTag():null),
					_index = me.__dumpIndex;

				me.__dumpIndex++;

				if(_name){
					_key = '#idx# [' + _name +'] #widgetName#@@@'+ _index;
				}else if(_tag){
					_key = '#idx# [' + _tag +'] #widgetName#@@@'+ _index;
				}else{
					_key = '#idx# [unkonw' + _index +'] #widgetName#@@@'+ _index;
				}

				var _widgetName="";
				for(var _n in ccui){
					if(typeof(ccui[_n])!='function')continue;
					if(child instanceof ccui[_n]){
						_widgetName = _n;
					}
				}
				_key = _key.replace('#widgetName#',_widgetName);

				db[_key] = {};
				if(child.getChildrenCount()>0){
					me.dumpUI( child, db[_key] );
				}
			}

			if(ifRoot){
				function dump(arr,level) {
					var dumped_text = "";
					if(!level) level = 0;
					var level_padding = "";
					for(var j=0;j<level+1;j++) level_padding += "|   ";

					if(typeof(arr) == 'object') {
						for(var item in arr) {
							var value = arr[item];

							var showItem = item.split('@@@')[0];
							showItem = showItem.replace('#idx#',level);
							if(typeof(value) == 'object') {
								dumped_text += level_padding + showItem + "\n";
								dumped_text += dump(value,level+1);
							}
						}
					}
					return dumped_text;
				}
				console . log(dump(me.__dumpInfo));
				delete me.__dumpInfo;
				delete me.__dumpIndex;
			}
		},
		show : function(frameConf,callback){
			var me = this;
			var _conf = {
				fill : false, //是否填充满屏
				showLoading : true, //是否显示加载中
				appendTo : null, //默认加到window中
			};

			var conf = cc.mixin(_conf,frameConf||{},function(d, s){
				return s;
			});
			
			if(cc.sys.isNative){
				//如果是打包后的版本，不需要预加载资源
				return me._show(conf,callback);
			}else {
				me.preloadJSON(function(){
					me._show(conf,callback);
				});
			}
		},
		_show : function(conf,callback){
			console.log('_show='+this._id);
			G.openingFrame[this._id] = 1;
			var me = this;
			me._conf = conf;

			if(me.singleGroup){
				//如果有唯一组标示（互斥frame)
				X.hideAllFrame({singleGroup:me.singleGroup,except:this._id});
				G.event.emit('showSingleGroup',me.singleGroup);
			}

			if(!me.isOpen){
				me.isOpen = true;
				if(!me._hasUI) {
					//如果是第一次打开窗口
					if(!me._prepared){
						//没预加载直接加载json
						var uiLoader = X.ccsload(this._json);
						me.ui = uiLoader.node;
						me.action = uiLoader.action;
					}
					if (conf.appendTo) {
						conf.appendTo.addChild(me.ui);
					}
					me.onWillShow && me.onWillShow();
					if(me.action){
						//如果有动画的话，播放in入场动画
						me.ui.runAction(me.action);
						me.action.isAnimationInfoExists('in') && me.action.play('in',false);
					}
					
					if(me._prepared){
						me.ui && me.ui.release();	
						me.action && me.action.release();	
						delete me._prepared;
					}

					//初始属性
					me._defaultAttr = {};
					for(var k in me){
						me._defaultAttr[k] = true;
					}

					me.onOpen && me.onOpen();
					me.emit('open');
					me._hasUI = true;
				}else{
					//如果之前是hide的，则直接加载
					if (conf.appendTo) {
						conf.appendTo.addChild(me.ui);
					}
					me.onWillShow && me.onWillShow();
					me.action && me.action.isAnimationInfoExists('in') && me.action.play('in',false);
					me.ui.release();
					me.action && me.action.release();
				}

				if(conf.fill){
					//填充满屏
					me.fillSize();
				}
			}

			//隐藏父窗体
			var hasInAni = false;
			if(me.action && me.action.isAnimationInfoExists('in')){
				hasInAni = true;
				var endIndex = me.action.getAnimationInfo('in').endIndex;
				me.action.setLastFrameCallFunc(function(){
					if(endIndex == me.action.getCurrentFrame()){
						me.action.pause();
						me.ui.setTimeout(function() {
							me.onAniShow && me.onAniShow();
							me.emit('aniShow');
							me.setParentVisible(false);
						},0);
					}
				});
			}else{
				me.setParentVisible(false);
			}
			
			me.ui.setVisible(true);
			me.goToTop();

			var needFreshShowedFrame = false;
			if(me.isShow!=true)needFreshShowedFrame=true; //如果原来不是显示状态，才需要重新计算
			me.isShow = true;
			me._canRemoving = true;
            checkOnTopFun(this._id);
			if(needFreshShowedFrame)freshShowedFrame(1);

			callback && callback.call(me);
			me.emit('willshow');
			me._checkCache(); //检查缓存是否过期

			me.onShow && me.onShow();
			me.emit('show');

			if(hasInAni==false){
				me.ui.setTimeout(function(){
					me.onAniShow && me.onAniShow();
					me.emit('aniShow');
				},0);
			}
		},
		fillSize : function(nodeStr){
			//外框自适应屏幕尺寸
			var me = this;
			if(nodeStr){
				me.ui.find(nodeStr).setSize(cc.view.getVisibleSize());
			}else{
				me.ui.setContentSize(cc.view.getVisibleSize());
			}
			ccui.helper.doLayout(nodeStr?me.ui.find(nodeStr):me.ui);
		},
		goToTop : function(){
			//置于顶端
			var maxZ = getMaxZ();
			if(this.modalFrame){
				modalZindex++;
				this.ui.zIndex = modalZindex;
			}else{
				this.ui.zIndex = maxZ+5;
			}
			this.ui.logicZindex = maxZ+5;
			G.openingFrame[this._id] = maxZ+5;
		},

		//监听事件
		on : function(funType,fun){
			this.event.on(funType,function(args){
				fun && fun(args);
			});
			return this;
		},
		once : function(funType,fun){
			//cc.log(this._id,'once',funType,fun);
			this.event.once(funType,function(args){
				fun && fun(args);
			});
			return this;
		},
		emit : function(type,args){
			//cc.log(this._id,'emit',type,this.event);
			this.event.emit(type,args);
		},
		_hideOrRemove : function(act,showAni){
			var me = this;

			//移除或者隐藏，判断是否需要播放动画
			if(act=='_remove' && !me.isOpen)return;
			if(act=='_hide' && !me.isShow)return;

			var cof = {showAni:true};
			if(showAni!=null)cof['showAni'] = showAni;
			
			me.setParentVisible(true);
			
			if(cof['showAni'] && me.action && me.action.isAnimationInfoExists('out')){
				var endIndex = me.action.getAnimationInfo('out').endIndex;
				me.action.setLastFrameCallFunc(function(){
					if(endIndex == me.action.getCurrentFrame()){
						me[act]();	
					}
				});
				if (me._canRemoving ) {
					me._canRemoving = false;
					me.action.play('out',false);
				}
			}else{
				me[act]();
			}
		},
		remove : function(showAni){
			return this._hideOrRemove('_remove',showAni);
		},
		_remove : function(){
			//删除
			var me = this;

			if(me.isOpen) {
				this.emit('willhide');
				this.emit('willclose');

				me.setParentVisible(true);
				console.log('remove='+me._id);
				delete G.openingFrame[me._id];
				delete this._extData;

				me.isTop = false;
				me.isShow = false;
				me.isOpen = false;
				me._hasUI = false;


				me.onHide && me.onHide();
				me.ui && me.ui.removeFromParent();
				me.onClose && me.onClose();


				checkOnTopFun();
				freshShowedFrame(2);
				delete me.ui;
				delete me.action;

				this.emit('hide');
				this.emit('close');

				delete me._parent;

				//删除非初始属性外的其他数据
				for(var k in me){
					if(!me._defaultAttr[k]){
						delete me[k];
					}
				}
				delete me._defaultAttr;

				me.autoReleaseRes();
				//cc.sys.garbageCollect();
			}
		},
		hide : function(showAni){
			//对上层兼容原来的hide方案
			if(this.cacheFrame){
				return this._hideOrRemove('_hide',showAni);
			}else{
				return this._hideOrRemove('_remove',showAni);
			}
		},
		_hide : function(){
			var me = this;
			if(me.isShow) {
				this.emit('willhide');
				me.ui.logicZindex = 0;
				me.ui.zIndex = 0;

				console.log('hide='+me._id);
				delete G.openingFrame[me._id];
				delete this._extData;

				me.isTop = false;
				me.isShow = false;
				me.isOpen = false;

				me.onHide && me.onHide();
				checkOnTopFun();
				freshShowedFrame(3);
				this.emit('hide');
				delete me._parent;

				me.ui.retain();
				me.action && me.action.retain();
				me.ui && me.ui.removeFromParent(false);
				//cc.sys.garbageCollect();
			}
		},
        onWillShow: function () {

        },
        onOpen: function () {

        }
	});

})();
