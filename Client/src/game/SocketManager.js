/**
 * Created by jfwang on 2017-07-27.
 * SocketManager 封装
 */

(function(){
	
var CHR1 = X.fmtCharCode(1),CHR2 = X.fmtCharCode(2),CHR3 = X.fmtCharCode(3),CHR4 = X.fmtCharCode(4);
G.SocketManager = {
	_socket : null,
	_socketDict : {},
	_msg:[],
	_sendKeys:{},
	_lagKeys:{"208":1,"209":1},
	_sockerIndex : 0,
	
	_ip : '',
	_port : '',
	_socketLeftString : '',
	timeout : 4000, //超时时间
	_wsReConnectTimes : 0, //重练次数
	_reConnectMax : 10, //最多重练次数
	_socketNotify : {},
	
	//连接服务器，返回socket对象
	connectServer : function(serverinfo){
		var me = this;
		me._serverinfo = serverinfo;
		
		var siArr = me._serverinfo.split(',');
		var randServer = X.arrayRand(siArr);
		var randSplit = randServer.split(':');
		
		me._ip = randSplit[0];
		me._port = randSplit[1];
		
		console.log('conn=='+ me._ip +':'+ me._port);
		me._sockerIndex++;
		for(var k in me._socketDict){
			delete me._socketDict[k];
		}

		var _socketKey = 's'+ (me._sockerIndex.toString());
		me._socketDict[_socketKey] = new WebSocket('ws://'+ me._ip +':'+ me._port);
		console.log('newSocket='+_socketKey);

		//超时处理
		me._timeoutTimer = setTimeout(function(){
			me.connectTimeoutCheck('timeout');
		},me.timeout);
		
		//消息队列处理逻辑 1s
		me._timeInterval = setInterval(function(){
			me.socketMessageLogic();
		},10);

		me.getSocketHandle().onopen = function(evt){
			C.log('G.SocketManager.onopen');
			me._wsReConnectTimes = 0;
			
			if(me._timeoutTimer){
				clearTimeout(me._timeoutTimer);	
				me._timeoutTimer = null;
			}
			if(me._reconnTimer){
				clearTimeout(me._reconnTimer);
				me._reconnTimer = null;
			}
			
			me.onopen && me.onopen(evt);
			G.event.emit('socket.onopen', evt);
		};
		
		me.getSocketHandle().onerror = function(evt){
			C.log('G.SocketManager.onerror');
			me.onerror && me.onerror(evt);
			G.event.emit('socket.onerror', evt);
			//G.frame.loading.hide();
		};

		me.getSocketHandle().onconnecting = function(v){
			C.log('G.SocketManager.onconnecting');
			me.onconnecting && me.onconnecting(v);
			G.event.emit('socket.onconnecting',null);
		};

		me.getSocketHandle().onclose = function(evt){
			console.log('me.forcedClose',me.forcedClose);
			//非强制关闭时，则自动重练
			if(!me.forcedClose){
				if(me.donotCheck!=true) me.connectTimeoutCheck('closed');
				delete me.forcedClose;
				delete me.donotCheck;
			}
			//G.frame.loading.hide();
			
			//重连置空消息队列
			me._msg = [];
			me._priorMsg = [];
			me._sendKeys = {};
		};

		me.getSocketHandle().onmessage = function(d){
			me.addSocketMessage(d);
		};

		return me.getSocketHandle();
	},
	
	addSocketMessage : function(d){
		var me = this;
		if (!me._msg) me._msg = [];
		if (!me._priorMsg) me._priorMsg = [];

		//数据完整性
		var data = d.data;
		if (!data) {
			console.log('socket接收数据为null，d='+JSON.stringify(d));
			return;
		}
		
		var _key = _code = '';
		if (data.substring(0,1)==CHR1){
			//兼容原来数字协议号
			var _callKey = data.substring(1,2);
			_code = data.substring(2,5);

			if(isNaN(_code*1)) {
				var _codeEnd = data.search("{");
				//定义消息号，标识字符串不要超过50个字符
				if (_codeEnd < 0 || _codeEnd>50) {
					_codeEnd = data.search(/\[.*\]/);
				};
				_code = data.substring(2,_codeEnd);
			}
			_key = _callKey+_code+'';
		}

		if (me._lagKeys[_code] != 1) {
			//消息优先处理表
			if (me._sendKeys[_key] == 1) {
				me._priorMsg.splice(0,0,d); 
				me._sendKeys[_key] = 0;
			}
			else
			{
				me._priorMsg.push(d);
			}
		}
		else
		{
			me._msg.push(d);
		}
	},

	//消息队列处理逻辑
	socketMessageLogic : function(){
		var me = this;
		
		//优先处理消息队列无消息，处理普通消息队列
		if (!me._priorMsg || me._priorMsg.length <=0) {
			me._socketMessageLogic();
		}
		else
		{
			me._priorSocketMsgLogic();
		}		
	},

	_socketMessageLogic : function(){
		var me = this;
		if (!me._msg || me._msg.length <=0) return;
		var d = me._msg.shift();

		me._socketMsgHandle && me._socketMsgHandle(d);
		G.event.emit('SocketManager.onmessage',d);
	},

	_priorSocketMsgLogic : function(){
		var me = this;
		if (!me._priorMsg || me._priorMsg.length <=0) return;
		var d = me._priorMsg.shift();

		me._socketMsgHandle && me._socketMsgHandle(d);
		G.event.emit('SocketManager.onmessage',d);
	},

	connectTimeoutCheck : function(v){
		var me = this;
		console.log('connectTimeoutCheck='+ v);
		if(me.getSocketHandle()){
			if(me._wsReConnectTimes >= me._reConnectMax){
				//重试过多后，应该提示玩家目前网络不稳定
				console.log('网络不稳定 请稍候再试');
				me.reTryTimeout && me.reTryTimeout(me._reConnectMax);
				me._wsReConnectTimes = 0;
				
				if(me._timeoutTimer){
					clearTimeout(me._timeoutTimer);	
					me._timeoutTimer = null;
				}
				if(me._reconnTimer){
					clearTimeout(me._reconnTimer);
					me._reconnTimer = null;
				}
			
			}else{
			    me._wsReConnectTimes++;
			    me.getSocketHandle().onconnecting && me.getSocketHandle().onconnecting(me._wsReConnectTimes);
			    console.log('重练'+ me._wsReConnectTimes);
			    if(v=='timeout'){
				   me.donotCheck = true;
				   me.getSocketHandle() && me.getSocketHandle().close();
				}
			    me.socketReconnect();
			}
		}
	},

	//执行重新连接
	socketReconnect : function(closed){
		var me = this;
		console.log('socketReconnect...');
		if(me._timeoutTimer)clearTimeout(me._timeoutTimer);
		if(me._reconnTimer)clearTimeout(me._reconnTimer);

		for(var k in me._socketDict){
			delete me._socketDict[k];
		}

		me._reconnTimer = setTimeout(function(){
			me.connectServer(me._serverinfo);
		},1000);
	},
	
	//返回socket句柄
	getSocketHandle : function(){
		return this._socketDict['s'+ (this._sockerIndex.toString())];
	},
	
	_socketMsgHandle : function(d){
		var me = this;
		var data = d.data;
		if (!data) {
			console.log('socket接收数据为null，d='+JSON.stringify(d));
			return;
		}

		C.log('socket接收='+data.replace(CHR1,'▶').replace(CHR2,'◀').replace(CHR4,'★').replace(CHR3,'◆'));
		me.serverToClient(data,function(code,args,callkey){
			if(cc.director && cc.director.getRunningScene() ){
				code = code.toString();
				if(args!='None') me._socketNotify[code] && me._socketNotify[code](args);
				
				if(callkey!=CHR4){
					G.SocketEventCallBack.callback(callkey,code,args);
				}
			}
		});
	},

	//服务器数据拆包粘包
	serverToClient : function (s,callFun){
		var me = this;
		if(me._socketLeftString!=''){
			s = me._socketLeftString + s;
		}
		if(s.length<6){
			me._socketLeftString = s;
			return;
		}
		if (s.substring(0,1)==CHR1){
			var _endChrIndex = s.indexOf(CHR2);
			if (_endChrIndex==-1){
				me._socketLeftString = s;
				return;
			}

			//兼容原来数字协议号
			var _callKey = s.substring(1,2);
			var _code = s.substring(2,5);
			var _data = s.substring(5,_endChrIndex);
			if(isNaN(_code*1)) {
				var _codeEnd = s.search("{");
				//定义消息号，标识字符串不要超过50个字符
				if (_codeEnd < 0 || _codeEnd>50) {
					_codeEnd = s.search(/\[.*\]/);
				};
				_code = s.substring(2,_codeEnd);
				_data = s.substring(_codeEnd,_endChrIndex);
			}
			
			me._socketLeftString = '';
			callFun && callFun(_code, _data,_callKey);
			
			if(_endChrIndex+1 != s.length){
				var _leftData = s.substring(_endChrIndex+1,s.length);
				me.serverToClient(_leftData,callFun);
			}
		}else{
			C.log('[G.SocketManager.serverToClient] substring(0,1)!=CHR1');
			me._socketLeftString = ''	;
		}
	},

	//格式化发送给服务器的数据
	fmtData : function(code,args,callKey){
		if('string'!=typeof(args) && 'number'!=typeof(args)){
			args = 	JSON.stringify(args);
		}
		return CHR1 + callKey + (code.toString()) + args + CHR2;
	},

	//发送数据给服务端
	//lock = 请求时是否锁定屏幕
	send : function(code,args,callback,lock){
        var me = this;
		if(code==null || args==null){
			C.log('[G.SocketManager.send] error, code or args must not null');
			return;
		}
		if(this.getSocketHandle()==null || this.getSocketHandle().readyState!=WebSocket.OPEN){
			C.log('[G.SocketManager.send] _socket is null');	
			return;
		}
		if (args != '' || args == 0){
            args = [].concat(args);
        }
		var _key = CHR4;
		if(callback)_key = 	G.SocketEventCallBack.add(code,callback);
				
		var _data = this.fmtData(code,args,_key);
		
		C.log('SOCKET发送：'+_data);
		if (!me._sendKeys) me._sendKeys = {};
		var k = _key+code+'';
		me._sendKeys[k] = 1;

		this.getSocketHandle().send(_data);
		//if(lock) G.frame.loading.show();
	},

	//服务器通知
	register: function(code,callback){
		var me = this;
		me._socketNotify[code] = callback;
	},

	close : function(){
		var me = this;
		me.forcedClose = true;
		me.getSocketHandle() && me.getSocketHandle().close && me.getSocketHandle().close();
	}

    ,onmessage: function(code,args){
        //args = JSON.parse(args);
    }
};

//模拟AJAX的CALLBACK机制
G.SocketEventCallBack = {
	_index : 65,
	data : {},
	
	add : function(code,fun){
		var me = this,code=code.toString();
		me._index++;
		if(me._index>=90)me._index=65;
		var _key = fmtCharCode(me._index); //'A-Z'
		me.data[_key] = {
			'code' : code,
			'fun' : fun	
		};
		me.data[_key]._timer = setTimeout(function(){
			//1500MS后，显示loading
			//G.frame.loading.show();
		},3500);

		return 	_key;	
	},
	
	callback : function(key,code,data){
		var me = this,code=code.toString(),key=key.toString();
		if(me.data[key]!=null){
			if (me.data[key]['code'] != '996' && me.data[key]['code'] != '100') {
				//G.frame.loading.hide();
			};

			if(me.data[key]._timer){
				clearTimeout(me.data[key]._timer);
			}
			
			if(code==me.data[key]['code']){
				if(data!='None'){
                    me.data[key]['fun'](data);
					
                    var d = X.toJSON(data);
					//if(d.tips) G.tip_NB.show(d.tips);
					
                    if (d.s == -101){
						
                    }else if (d.s == -102){
						
                    }else if (d.s == -103){
						
                    }else if (d.s == -104){
						
                    }else if (d.s == -99 || d.s == -106){
                        
                    }else if (d.s == -107){

                    }
                }
				delete me.data[key]
			}
			else
			{
				C.log('CODE不匹配:'+code);
			}			
		}
	}
};


})();