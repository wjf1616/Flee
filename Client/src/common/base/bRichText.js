/**
 * Created by jfwang on 2017-07-28.
 * 带色彩文中控件
 */
(function(){
	X.bRichText = ccui.Layout.extend({
		ctor: function(conf){
			this._super();
			//X.bObject.call(this);

			this.conf = conf;

			this.offSetX = 0;
			this.offSetY = 0;

			this._line = [];
			this._preLineMaxHeight = 0; //上一行最高的元素的值
			this._lineMaxHeight = 0; //本行最高的元素的值

			this._trueWidth = 0;
		}
		,initData: function(args){
			this.args = args;
			for(var key in args){
				var fun = key;
				this[fun] && typeof this[fun] == 'function' && this[fun](args[key]);
			}
			return this;
		}
		//获取富文本框的真实尺寸
		,trueWidth : function(){
			return this._trueWidth;
		}
		,trueHeight: function(){
			return this._trueHeight;
		}
		,text: function(c,argumentsNodes){
			//可以是 text('str<font node=1></font>',node1,node2)
			//也可以是 text('str<font node=1></font>',[node1,node2])
			if(typeof(c)=='string'){
				c = this._fmtString(c);
			}
			for(var i=0;i<c.length;i++){
				var v = c[i];
				if(typeof(v)=='string'){
					v = {'size':this.conf.size,'family':this.conf.family || '微软雅黑', 'color': this.conf.color,'content':v};
				}
				if(v.node){
					if(cc.isArray(argumentsNodes)){
						var nodeIdx = v.node*1-1;
						if(argumentsNodes[nodeIdx]){
							v.node = argumentsNodes[nodeIdx];
							this._addMsg(v);
						}
					}else{
						var nodeIdx = v.node*1;
						if(arguments[nodeIdx]){
							v.node = arguments[nodeIdx];
							this._addMsg(v);
						}
					}

				}else{
					this._addMsg(v);
				}
			}
			this._drawLine();
			return this;
		}
		//格式化字符串
		,_fmtString : function(str){
			var _arr = str.split(/(<font.*?>)(.*?)<\/font>/g);
			var _res = [],_tmp={},_tmpLock=false;
			for(var i=0;i<_arr.length;i++){
				if(_arr[i].substr(0,5)=='<font'){
					_arr[i] = _arr[i].replace('>',' >');
					var _re = /(.*?)=(.*?) /g;
					while(_re.exec(_arr[i])!=null){
						_tmpLock = true;
						_tmp[RegExp.$1.replace('<font ','')] = RegExp.$2;
					}
				}else{
					if(_tmpLock){
						_tmp['content'] = _arr[i];
						_res.push(_tmp);
						_tmpLock = false;
						_tmp={}
					}else{
						_res.push(_arr[i]);
					}
				}
			}

			var __res=[];
			for(var j=0;j<_res.length;j++){
				if(typeof(_res[j])=='string'){
					var x = _res[j].split('<br>');
					if(x.length>1){
						for(var _xx=0;_xx<x.length;_xx++){
							__res.push(x[_xx]);
							if(_xx<x.length-1)__res.push("<br>");
						}
					}else{
						__res.push(_res[j]);
					}
				}else{
					__res.push(_res[j]);
				}
			}
			return __res;
		}
		,_addMsg : function(v,drawNow){
			var _size=null;
			this._forTimers = this._forTimers || 1;
			//防止某些未知情况出现死循环
			this._forTimers++;

			var _node;
			if(v.node){
				_node = v.node;
				_node.setAnchorPoint && _node.setAnchorPoint(C.ANCHOR[4]);
				_size = {width:_node.width * (_node.getScaleX?_node.getScaleX():1) ,height:_node.height * (_node.getScaleY?_node.getScaleY():1)};
			}else{
				if(v.content=='<br>'){
					v.content='';
					_size = {height:0,width:this.conf.maxWidth-1};
				}
				v.content = v.content.toString();
				var _defaultFamily = (C.isJSB?"":"微软雅黑");
				_node = new ccui.Text(v.content||'', this.conf.family ||_defaultFamily , v.size || this.conf.size);

				_node.setTextColor(C.color( v.color || this.conf.color));
				_node.setColor(cc.color('#ffffff'));
				_node.setAnchorPoint(C.ANCHOR[4]);
				this.conf.eachText && this.conf.eachText(_node);
				if(_size==null)_size = _node.getContentSize();
			}


			if(v.onclick){
				_node.setTouchEnabled(true);
				_node.touch(function (sender, type) {
					if (type == ccui.Widget.TOUCH_ENDED){
						try{
							eval(v.onclick);
						}catch(e){}
					}
				},this);
			}

			if(_size.height > this._lineMaxHeight)this._lineMaxHeight=_size.height;

			if(_size.width + this.offSetX <= this.conf.maxWidth){
				//当前行可以放下
				this._line.push([_node,this.offSetX]);
				this.offSetX += _size.width;
				if(drawNow)this._drawLine();
				return;
			}else{

				if(v.node){
					//如果是节点，但是本行放不下时，强行插入无视溢出
					this._line.push([_node,this.offSetX]);
					this.offSetX += _size.width;
					this._drawLine();
					return;
				}

				//放不下时 平均每个字宽
				var _avgWidth = _size.width/v.content.length;
				var _leftStringLen = (this.conf.maxWidth - this.offSetX) / _avgWidth;

				if(_leftStringLen>=1){
					var _copy = JSON.parse(JSON.stringify(v));
					_copy.content = _copy.content.substr(0,_leftStringLen);

					this._addMsg(_copy,true);

					v.content = v.content.substr(_leftStringLen,v.content.length);
					this._addMsg(v);
				}else{
					this._drawLine();
					this._addMsg(v);
				}
			}
		}
		,_drawLine : function(){
			if(this._line.length==0)return;

			if(this.offSetX>this._trueWidth)this._trueWidth=this.offSetX;

			var offsetY  = 0;
			if(this._preLineMaxHeight > 0){
				offsetY = parseInt(Math.max.apply(null,[this._preLineMaxHeight*.5 + this._lineMaxHeight*.5 ,this.conf.lineHeight]),10);
			}
            if (this.conf.minimumLineSpace != undefined){
                offsetY += this.conf.minimumLineSpace;
            }
			this.offSetY -= offsetY;
			this.offSetX = 0;

			for(var i=0;i<this._line.length;i++){
				this._line[i][0].setPosition(cc.p( this._line[i][1] , this.offSetY));
				this.addChild(this._line[i][0]);
			}

			this._line = [];
			this._preLineMaxHeight = this._lineMaxHeight;
			this._trueHeight = Math.abs(this.offSetY - this._preLineMaxHeight);

			//this.setContentSize(cc.size(this._trueWidth,this._trueHeight));

			this._lineMaxHeight = 0;
		}
	});
})();