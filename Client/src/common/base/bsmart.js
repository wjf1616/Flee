/**
 * Created by jfwang on 2017-07-27.
 * 基础功能使用封装
 */
(function(global){
/*
cc.loader.loadJSON不会处理cc.loader.resPath，并且没有优先热更目录，导致热更失效
 */
X.loadJSON = function(file,callback){
	var resFile = cc.loader.resPath+'/'+file;

	if(cc.sys.isNative){
		var storagePath  = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
		var hotJson = storagePath+file;

		if(jsb.fileUtils.isFileExist( hotJson )){
			resFile = hotJson;
		}
	}
	cc.loader.loadJson(resFile , function(err,json){
		callback && callback(err,json);
	});
};

cc.setProgram = function (node, program) {
    node.shaderProgram = program;

    var children = node.children;
    if (!children)
        return;

    for (var i = 0; i < children.length; i++)
        cc.setProgram(children[i], program);
};

//按name链查找对象 a.b.c.d	
cc.Node.prototype.find = function(v){
	v = v.toString();
	if(v.indexOf('.')!=-1){
		var findArr=v.split('.'),tmpNode=this,_key="";
		if(!cc.sys.isObjectValid(tmpNode))return null;
		
		while(findArr.length>0){
			_key = findArr.shift().trim();
			tmpNode = tmpNode.find(_key);
			if(!cc.sys.isObjectValid(tmpNode)){
				return null;	
			}
		}
		return tmpNode;	
	}
	
	var me = this,node=null;
	if(me.getChildByTag && !isNaN(v)){
		node = me.getChildByTag(parseInt(v));
		if(cc.sys.isObjectValid(node)){
			return node;
		}
	}
	
	if(me.getChildByName){
		node = me.getChildByName(v);
		if(cc.sys.isObjectValid(node)){
			return node;
		}
	}
	console.log('致命错误!! find子对象时 '+ v + ' 未找到');
	return node;
};

//查找所有子里第一个等于v的node
//重写ccui.helper.seekWidgetByTag和ccui.helper.seekWidgetByName以维持与c++结果一致
function seekByName(root, name , onlyWidget) {
	if(onlyWidget==null)onlyWidget=true;

	if (!root)
		return null;
	if (root.getName() === name)
		return root;
	var arrayRootChildren = root.getChildren();
	var length = arrayRootChildren.length;
	for (var i = 0; i < length; i++) {
		var child = arrayRootChildren[i];
		if( (!(child instanceof ccui.Widget)) && onlyWidget){
			//cc.log(child);
			//cc.log('^ this child is not widget, when finds '+ name);
			continue;
		}
		var res = seekByName(child, name ,onlyWidget);
		if (res !== null)
			return res;
	}
	return null;
}
function seekByTag(root, tag) {
	if (!root)
		return null;
	if (root.getTag() === tag)
		return root;

	var arrayRootChildren = root.getChildren();
	var length = arrayRootChildren.length;
	for (var i = 0; i < length; i++) {
		var child = arrayRootChildren[i];
		if(!(child instanceof ccui.Widget)){
			//cc.log(child);
			//cc.log('^ this child is not widget, when finds '+ name);
			continue;
		}
		var res = seekByTag(child, tag);
		if (res !== null)
			return res;
	}
	return null;
}
cc.Node.prototype.finds = function(v){

	var target = this;
	if( this instanceof ccui.ScrollView && this.getChildrenCount()==1){
		//兼容处理tableView
		var node = this.getChildren()[0];
		if(node instanceof cc.TableView){
			target = node.getChildren()[0];
			return seekByName(target,v,false);
		}
	}

	if(cc.sys.isNative){
		return ccui.helper.seekWidgetByName(target,v);
	}else{
		return seekByName(target,v);
	}
};

//按a.b的结构来找,同时缓存到this
cc.Node.prototype.findsByPath = function(v){
    if (this[v] != undefined){
        return this[v];
    }
    var target = this;
    var path = v.split('.');
    if( this instanceof ccui.ScrollView && this.getChildrenCount()==1){
        //兼容处理tableView
        var node = this.getChildren()[0];
        if(node instanceof cc.TableView){
            target = node.getChildren()[0];
            for (var i in path){
                target = seekByName(target,path[i]);
            }
            this[v] = target;
            return target;
        }
    }

    for (var i in path){
        if(cc.sys.isNative){
            target = ccui.helper.seekWidgetByName(target,path[i]);
        }else{
            target = seekByName(target,path[i]);
        }
    }
    this[v] = target;
    return target;

};

cc.Node.prototype.show = function(){
	this.setVisible(true);
	this.onNodeShow && this.onNodeShow();
};
cc.Node.prototype.hide = function(){
	this.setVisible(false);
	this.onNodeHide && this.onNodeHide();
};

function _preloadJSON(json,callback){
	cc.loader.load(json,function (result, count, loadedCount) {
		if(
			result && result.Content && result.Content.Content
			&& result.Content.Content.UsedResources
			&& result.Content.Content.UsedResources.length>0
		){
			_preloadUsedResources(result.Content.Content.UsedResources,callback);
		}else{
			callback && callback();
		}
	},function(){

	});
}
//预加载用到的资源
function _preloadUsedResources(list,callback){
	cc.loader.load(list,function (result, count, loadedCount) {
		//cc.log(loadedCount,count,result);
	},function(){
		callback && callback();
	});
}

//加载CCUI的json配置，并预加载所需的资源
X.ccui = function(json,callback){
	if(cc.sys.isNative) {
		var _loader = X.ccsload(json);
		callback && callback(_loader);
	}else{
		_preloadJSON(json,function(){
			var _loader = X.ccsload(json);
			callback && callback(_loader);
		});
	}
};

X.ccsload = function(file){
	if(ccs.CSLoader && cc.sys.isNative && C.USECSB){
		//如果扩展支持加载csb模式
		file = file.replace('.json','.csb');
		return {
			node:ccs.CSLoader.createNode(file),
			action:ccs.CSLoader.createTimeline(file)
		}
	}else{
		return ccs.load(file);
	}
};

/*
链式异步执行
X.async([function(callback){
	a(1,callback)
},function(callback){
	b(2,callback)
},function(callback){
	c(3,callback)
}],function(){
	alert('over');	
});
*/
X.async = function(funArray,endCall,delay){
	~function next(){
		if(funArray.length==0){
			endCall && endCall();
			return;	
		}
		if(delay && delay>0){
			var scene = cc.director.getRunningScene();
			scene && scene.setTimeout(function(){
				var fn = funArray.shift();
				fn && fn(next);
			},delay)
		}else{
			var fn = funArray.shift();
			fn && fn(next);
		}
	}();
};
//平均显示scrollview的子坐标
//{rownum:一行显示多少个,type:'fill||avg' 铺满还是平均}
ccui.ScrollView.prototype.setAutoChildrenPos = function(c){
	var w = this.width; //总宽度
	var children = this.getChildren();
	if(children.length==0)return;

	if(c.order)children.sort(c.order);
	
	var cw = children[0].width,
		ch = children[0].height; //子元素尺寸
	var type = c.type||'fill';
	var maxrow = Math.ceil(children.length/c.rownum);
	var lineheight = c.lineheight || ch;
	
	var innerHeight = this.height;
	if(innerHeight < maxrow*lineheight) innerHeight = maxrow*lineheight; 
	this.innerHeight = innerHeight;
	
	var _lineidx = 0;
	var _anchor = C.ANCHOR[1];

	for(var i=0;i<children.length;i++){
		children.autoSortIndex = i;
		if(type=='fill'){
			//填充满
			var sw = (w-cw)/(c.rownum-1);
			children[i].x = i%c.rownum*sw;
		}else if(type=='avg'){
			//平均排布
			var margin = w-cw*c.rownum,
			smargin = margin/(c.rownum+1);
			children[i].x = (i%c.rownum)*cw + smargin* ((i%c.rownum)+1);
		}
        _lineidx = parseInt(i/c.rownum);
		children[i].setAnchorPoint(_anchor);
		children[i].y = innerHeight-_lineidx*lineheight;
	}
	c.callback && c.callback(children);
};

//将一组btn设置为单选
X.radio = function(btns,onChange,obj){
	var color1,color2;
	if (obj && obj.color) {
		color1 = obj.color[0];
		color2 = obj.color[1];
	} else {
		color1 = '#ffba35';
		color2 = '#b1b1b1';
	}
	for(var i=0;i<btns.length;i++){
		btns[i].touch(function(sender,type,fromwhere){
			if(type==ccui.Widget.TOUCH_ENDED){
                if (fromwhere!='fromcode' && !sender.isBright()){
                    return;
                }
				for(var j = 0;j<btns.length;j++){
					if(sender==btns[j]){
						if (!sender.disable) {
							sender.setBright(false);
							sender.setTitleColor && sender.setTitleColor(C.color(color1));
						}
						sender.setTimeout(function(){
							onChange && onChange(sender);
						},1);
					}else{
						if (!sender.disable) {
							btns[j].setTitleColor && btns[j].setTitleColor(C.color(color2));
							btns[j].setBright(true);
						}
					}
				}
			}
		});	
	}
};

//点击事件
ccui.Widget.TOUCH_NOMOVE = 99;
ccui.Widget.prototype.touch = function(fun,caller){
    var me = this;
	this._touchFunction = function(sender,type,fromwhere){
		fun.call(me._touchCaller,sender,type,fromwhere);
		if (!cc.sys.isObjectValid(sender)) return;
        G.event.emit('TOUCH_EVENT_TRIGGER',sender,type);
        if (type == ccui.Widget.TOUCH_ENDED){
            var start = sender.getTouchBeganPosition(),
            	end = sender.getTouchEndPosition();

            var dis = cc.pDistance(start,end);
            if(dis<10){
                fun.call(me._touchCaller,sender,ccui.Widget.TOUCH_NOMOVE);
            }
        }
	};
	this._touchCaller = caller||this;
	this.addTouchEventListener(this._touchFunction,this._touchCaller);
	return this;
};
//触发点击事件
ccui.Widget.prototype.triggerTouch = function(type){
	if(!this._touchFunction)return;
	this._touchFunction(this,type,"fromcode");
};

//timeout相关扩展
function setTimer(target,callback,interval,repeat,delay){
	target.schedule(callback,interval/1000,repeat,delay);
	return callback;
}

function clearTimer(target,callfun){
	target.unschedule(callfun);
	return true;
}

cc.Node.prototype.setTimeout = function (callback, interval,repeat,delay) {
	return setTimer(this, function(){
		callback && callback.call(this);	
	}, interval||0, repeat||0, delay||0);
};
cc.Node.prototype.setInterval = function (callback, interval) {
	return setTimer(this, function(){
		callback && callback.call(this);	
	}, interval||0, cc.REPEAT_FOREVER, 0);
};
cc.Node.prototype.clearAllTimers = function(){
	return this.unscheduleAllCallbacks();
};
cc.Node.prototype.clearInterval = cc.Node.prototype.clearTimeout = function (callfun) {
	return clearTimer(this, callfun);
};

})(this);

(function(global){
	//将src对象上的属性copy到des对象上，默认不覆盖des对象原有属性，mixer为function可以选择属性的覆盖方式
	cc.mixin = function(des, src, mixer) {
		mixer = mixer || function(d, s){
			if(typeof d === 'undefined'){
				return s;
			}
		}

		if(mixer == true){
			mixer = function(d, s){return s};
		} 		

		for (var i in src) {
			var v = mixer(des[i], src[i], i, des, src);
			if(typeof v !== 'undefined'){
				des[i] = v;
			}
		}

		return des;
	};	
	
	cc.isUndefined = function(arg) {
		return arg === void 0;
	};

	cc.isObject = function(arg) {
		return typeof arg === 'object' && arg !== null;
	};
	
	cc.isFunction = function(arg) {
		return typeof arg === 'function';
	};	

})(this);


(function(global){	
	function Animation(){
		
	}
	var getAnimFrames = function(name, startIndex, endIndex) {
		var frames = [],
		i = 0,
		startIndex = startIndex || 0;
		var reversed = false, cached = false;

		if(endIndex == null){
			//没有限定范围只能从cache中取
			endIndex = 99999;
			cached = true;
		}

		if(startIndex > endIndex){
			var tmp = endIndex;
			endIndex = startIndex;
			startIndex = tmp;
			reversed = true;
		}
		var length = (endIndex - startIndex) + 1;

		do {
			var frameName = name.replace('%d', startIndex + i),
			frame = cc.spriteFrameCache.getSpriteFrame(frameName, cached);

			if(frame) {
				frames.push(frame);
			}else {
				break;
			}

		} while (++i < length);

		if(reversed){ 
			frames.reverse();
		}

		return frames; 
	};
	
	cc.mixin(Animation.prototype, {
		_getActionList: function(){
			this.__actions = this.__actions || [];
			return this.__actions;
		},
		_getAction: function(){
			this.__spawn = this.__spawn || [];
			if(this._getActionList().length > 0){
				this.spawn();
			}
			if(this.__spawn.length > 1){
				return cc.Spawn.create.apply(cc.Spawn, this.__spawn);
			}else if(this.__spawn.length == 1){
				return this.__spawn[0];
			}
		},
		_addAction: function(actionCls, args, easing, rate){
			var actions;
			
			if(actionCls instanceof Animation){
				actionCls = actionCls._getAction().clone();
			}
			
			if(actionCls instanceof cc.Action){
				rate = easing;
				easing = args;
				actions = [actionCls];
			}else{
				for(var i = args.length - 1; i >= 0; i--){
					if(args[i] !== undefined){
						break;
					}
				}
				args.length = i + 1;
				actions = [actionCls.create.apply(actionCls, args)];
			}
			if(easing){
				//rate = rate || 2;
				var easingArgs = [].slice.call(arguments, 3);
				for(var i = easingArgs.length - 1; i >= 0; i--){
					if(easingArgs[i] !== undefined){
						//easingArgs.length = i + 1;
						break;
					}
				}
				easingArgs.length = i + 1;
				//cc.log(i, easingArgs);
				actions[0] = easing.create.apply(easing, [actions[0]].concat(easingArgs));
			}
			var actionSeq = this._getActionList();
			actionSeq.push.apply(actionSeq, actions);
			return this;
		},	
		delay: function(time){
			return this._addAction(cc.DelayTime, [time]);
		},
		/**
		 *  times - repeat time
		 *  fromWhere - default 0, repeat all sequences before
		 */
		repeat: function(times, fromWhere){
			times = times || 9999999;
			fromWhere = fromWhere || 0;
			var actionSeq = this._getActionList();
			if(actionSeq.length > 0){
				var action = cc.Sequence.create.apply(cc.Sequence, actionSeq.slice(-fromWhere));
				action = cc.Repeat.create(action, times);
				if(fromWhere == 0) actionSeq.length = 0;
				else actionSeq.length = actionSeq.length - fromWhere;
				actionSeq.push(action);
			}
			return this;        
		},
		reverse: function(){
			var actionSeq = this._getActionList();
			if(actionSeq.length > 0){
				var action = actionSeq[actionSeq.length - 1];
				actionSeq.push(action.reverse());
			}
			return this;
		},
		reverseAll: function(){
			var actionSeq = this._getActionList();
			if(actionSeq.length > 0){
				var action = cc.Sequence.create.apply(cc.Sequence, actionSeq);
				actionSeq.push(action.reverse());
			}
			return this;
		},
		then: function(callFun){
			var callback = cc.CallFunc.create(callFun, this);
			this._getActionList().push(callback);            
			return this;
		},
		bezierBy: function(dur, conf, easing, rate){
			return this._addAction(cc.BezierBy, [dur, conf], easing, rate);
		},
		bezierTo: function(dur, conf, easing, rate){
			return this._addAction(cc.BezierTo, [dur, conf], easing, rate);
		},
		blink: function(dur, blinks, easing, rate){
			return this._addAction(cc.Blink, [dur, blinks], easing, rate);
		},
		fadeIn: function(dur, easing, rate){
			return this._addAction(cc.FadeIn, [dur], easing, rate);
		},
		fadeOut: function(dur, easing, rate){
			return this._addAction(cc.FadeOut, [dur], easing, rate);
		},
		fadeTo: function(dur, opacity, easing, rate){
			return this._addAction(cc.FadeTo, [dur, opacity], easing, rate);
		},
		jumpBy: function(dur, pos, height, times, easing, rate){
			return this._addAction(cc.JumpBy, [dur, pos, height, times || 1], easing, rate);        
		},
		jumpTo: function(dur, pos, height, times, easing, rate){
			return this._addAction(cc.JumpTo, [dur, pos, height, times || 1], easing, rate);
		},
		moveBy: function(dur, pos, easing, rate){
			return this._addAction(cc.MoveBy, [dur, pos], easing, rate);
		},
		moveTo: function(dur, pos, easing, rate){
			return this._addAction(cc.MoveTo, [dur, pos], easing, rate);
		},
		rotateBy: function(dur, deltaX, deltaY, easing, rate){
			return this._addAction(cc.RotateBy, [dur, deltaX, deltaY], easing, rate);
		},
		rotateTo: function(dur, deltaX, deltaY, easing, rate){
			return this._addAction(cc.RotateTo, [dur, deltaX, deltaY], easing, rate);
		},
		scaleBy: function(dur, sx, sy, easing, rate){
			return this._addAction(cc.ScaleBy, [dur, sx, sy], easing, rate);
		},
		scaleTo: function(dur, sx, sy, easing, rate){
			return this._addAction(cc.ScaleTo, [dur, sx, sy], easing, rate);
		},
		skewBy: function(dur, sx, sy, easing, rate){
			return this._addAction(cc.SkewBy, [dur, sx, sy], easing, rate);
		},
		skewTo: function(dur, sx, sy, easing, rate){
			return this._addAction(cc.SkewTo, [dur, sx, sy], easing, rate);
		},
		tintBy: function(dur, deltaR, deltaG, deltaB, easing, rate){
			return this._addAction(cc.TintBy, [dur, deltaR, deltaG, deltaB], easing, rate);
		},
		tintTo: function(dur, deltaR, deltaG, deltaB, easing, rate){
			return this._addAction(cc.TintTo, [dur, deltaR, deltaG, deltaB], easing, rate);        
		},
		/**
	        sprite.animate(0.2, 'a.png', 'b.png', 'c.png');
	        sprite.animate(0.2, 'abc_%d.png');
	        sprite.animate(0.2, 'abc_%d.png', startIndex, endIndex);
		 */
		animate: function(dur /* frames */){
			var frames = [].slice.call(arguments, 1);

			if(/%d/.test(frames[0])){
				frames = getAnimFrames.apply(null, frames);
			}else{
				frames = frames.map(function(frameName){
					return cc.spriteFrameCache.getSpriteFrame(frameName);
				});
			}

			var animation = cc.Animation.create(frames, dur/frames.length);
			this._getActionList().push(cc.Animate.create(animation));
			return this;			
		},
		spawn: function(){
			this.__spawn = this.__spawn || [];
			var actionSeq = this._getActionList();
			if(actionSeq.length > 0){
				var action = actionSeq[0];
				if(actionSeq.length > 1){
					action = cc.Sequence.create.apply(cc.Sequence, actionSeq);
				}
				this.__spawn.push(action);
				actionSeq.length = 0;
			}
			return this;
		}
	});
	
	Animation.prototype.play = Animation.prototype.addAction;
	
	cc.mixin(cc.Node.prototype, new Animation);
	
	cc.AnimationFragement = Animation;
	cc.AnimationFragement.create = function(){
		return new cc.AnimationFragement();
	}
	
	cc.Node.prototype.run = function(){
		var action = this._getAction();
		if(action){
			this.runAction(action);
			this._getActionList().length = 0;
			this.__spawn.length = 0;
			return action;
		}
		return null;
	}
	
})(this);


(function(global){
	
	function EventEmitter() {
		this._events = this._events || {};
		this._maxListeners = this._maxListeners || undefined;
	}

//	Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

//	By default EventEmitters will print a warning if more than 10 listeners are
//	added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;


//	Obviously not all Emitters should be limited to 10. This function allows
//	that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
		if (isNaN(n) || n < 0 )
			throw TypeError('n must be a positive number');
		this._maxListeners = n;
		return this;
	};

	EventEmitter.prototype.emit = function(type) {
		var er, handler, len, args, i, listeners;

		if (!this._events)
			this._events = {};

		// If there is no 'error' event listener then throw.
		if (type === 'error' && !this._events.error) {
			er = arguments[1];
			if (er instanceof Error) {
				throw er; // Unhandled 'error' event
			} else {
				throw Error('Uncaught, unspecified "error" event.');
			}
			return false;
		}

		handler = this._events[type];

		if (cc.isUndefined(handler))
			return false;

		if (cc.isFunction(handler)) {
			switch (arguments.length) {
			// fast cases
			case 1:
				handler.call(this);
				break;
			case 2:
				handler.call(this, arguments[1]);
				break;
			case 3:
				handler.call(this, arguments[1], arguments[2]);
				break;
				// slower
			default:
				len = arguments.length;
			args = new Array(len - 1);
			for (i = 1; i < len; i++)
				args[i - 1] = arguments[i];
			handler.apply(this, args);
			}
		} else if (cc.isObject(handler)) {
			len = arguments.length;
			args = new Array(len - 1);
			for (i = 1; i < len; i++)
				args[i - 1] = arguments[i];

			listeners = handler.slice();
			len = listeners.length;
			for (i = 0; i < len; i++)
				listeners[i].apply(this, args);
		}

		return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
		var m;

		if (!cc.isFunction(listener))
			throw TypeError('listener must be a function');

		if (!this._events)
			this._events = {};

		// To avoid recursion in the case that type === "newListener"! Before
		// adding it to the listeners, first emit "newListener".
		if (this._events.newListener)
			this.emit('newListener', type,
					cc.isFunction(listener.listener) ?
							listener.listener : listener);

		if (!this._events[type])
			// Optimize the case of one listener. Don't need the extra array object.
			this._events[type] = listener;
		else if (cc.isObject(this._events[type]))
			// If we've already got an array, just append.
			this._events[type].push(listener);
		else
			// Adding the second element, need to change to array.
			this._events[type] = [this._events[type], listener];

		// Check for listener leak
		if (cc.isObject(this._events[type]) && !this._events[type].warned) {
			var m;
			if (!cc.isUndefined(this._maxListeners)) {
				m = this._maxListeners;
			} else {
				m = EventEmitter.defaultMaxListeners;
			}

			if (m && m > 0 && this._events[type].length > m) {
				this._events[type].warned = true;
				console.error('(node) warning: possible EventEmitter memory ' +
						'leak detected. %d listeners added. ' +
						'Use emitter.setMaxListeners() to increase limit.',
						this._events[type].length);
				console.trace();
			}
		}

		return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
		if (!cc.isFunction(listener))
			throw TypeError('listener must be a function');

		var fired = false;

		function g() {
			this.removeListener(type, g);

			if (!fired) {
				fired = true;
				listener.apply(this, arguments);
			}
		}

		g.listener = listener;
		this.on(type, g);

		return this;
	};

//	emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
		var list, position, length, i;

		if (!cc.isFunction(listener))
			throw TypeError('listener must be a function');

		if (!this._events || !this._events[type])
			return this;

		list = this._events[type];
		length = list.length;
		position = -1;

		if (list === listener ||
				(cc.isFunction(list.listener) && list.listener === listener)) {
			delete this._events[type];
			if (this._events.removeListener)
				this.emit('removeListener', type, listener);

		} else if (cc.isObject(list)) {
			for (i = length; i-- > 0;) {
				if (list[i] === listener ||
						(list[i].listener && list[i].listener === listener)) {
					position = i;
					break;
				}
			}

			if (position < 0)
				return this;

			if (list.length === 1) {
				list.length = 0;
				delete this._events[type];
			} else {
				list.splice(position, 1);
			}

			if (this._events.removeListener)
				this.emit('removeListener', type, listener);
		}

		return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
		var key, listeners;

		if (!this._events)
			return this;

		// not listening for removeListener, no need to emit
		if (!this._events.removeListener) {
			if (arguments.length === 0)
				this._events = {};
			else if (this._events[type])
				delete this._events[type];
			return this;
		}

		// emit removeListener for all listeners on all events
		if (arguments.length === 0) {
			for (key in this._events) {
				if (key === 'removeListener') continue;
				this.removeAllListeners(key);
			}
			this.removeAllListeners('removeListener');
			this._events = {};
			return this;
		}

		listeners = this._events[type];

		if (cc.isFunction(listeners)) {
			this.removeListener(type, listeners);
		} else if (Array.isArray(listeners)) {
			// LIFO order
			while (listeners.length)
				this.removeListener(type, listeners[listeners.length - 1]);
		}
		delete this._events[type];

		return this;
	};

	EventEmitter.prototype.listeners = function(type) {
		var ret;
		if (!this._events || !this._events[type])
			ret = [];
		else if (cc.isFunction(this._events[type]))
			ret = [this._events[type]];
		else
			ret = this._events[type].slice();
		return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
		var ret;
		if (!emitter._events || !emitter._events[type])
			ret = 0;
		else if (cc.isFunction(emitter._events[type]))
			ret = 1;
		else
			ret = emitter._events[type].length;
		return ret;
	};
	
	cc.EventEmitter = EventEmitter;
	cc.EventEmitter.create = function(){
		return new EventEmitter();
	}
})(this);
