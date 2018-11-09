/**
 * Created by jfwang on 2017-07-25.
 * 公用接口
 */
(function(global){
	global.C = {};//for cocos
	global.X = {};//for me
	global.window = global.window || {};
	
	//判断是否JSB打包
	C.isJSB = (typeof(require)=='function'?true:false);
	
	C.log = function(){
		if(typeof(G)=='object' && G.DEBUG==false){
			return;
		}
		var _log = arguments;
		if(arguments.length==1){
			_log=arguments[0]
		}else{
			_log = JSON.stringify(arguments);	
		}
		
	    if (C.isJSB){
			cc.log('-----------------');
	        cc.log(_log);
	    }else{
			console.log('-----------------');
			console.log(_log);
		}
	};
	
	// C.init = function(){
	// 	C.D = cc.director;
	// };
	
	C.ANCHOR = {
		1: cc.p(0,1)
		,2: cc.p(0.5,1)
		,3: cc.p(1,1)
		,4: cc.p(0,0.5)
		,5: cc.p(0.5,0.5)
		,6: cc.p(1,0.5)
		,7: cc.p(0,0)
		,8: cc.p(0.5,0)
		,9: cc.p(1,0)
	};


    C.color = function(hex){
        if (hex.length == 4){
            hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        var c = cc.color(0,0,0,255);
        c.r = parseInt('0x'+hex.substr(1,2)) || 0;
        c.g = parseInt('0x'+hex.substr(3,2)) || 0;
        c.b = parseInt('0x'+hex.substr(5,2)) || 0;
        return c;
    };
})(this);
