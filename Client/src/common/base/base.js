/**
 * Created by jfwang on 2017-07-27.
 * 项目基础使用封装
 */
(function(){
    X.cache = function(k,v){
        if (v == null){
			var v = cc.sys.localStorage.getItem(k);
			if(v!=null)v=decodeURIComponent(cc.sys.localStorage.getItem(k));
			return v;
		}else{
            cc.sys.localStorage.setItem(k,encodeURIComponent(v));
		}
    };

	X.delCache = function(k){
        cc.sys.localStorage.removeItem(k);
    };
	
    X.toJSON = function(str){
		var _json=null;
		try{
			_json = JSON.parse(str);
		}catch(e){
			cc.log('to JSON ERROR='+ str);
		}
        return _json;
    };

    X.fmtCharCode = function(code){
        return String.fromCharCode(code);
    };

    function _S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    X.UUID = function(s4Len){
        var str = "";
        for(var i=0;i<s4Len;i++){
            str+=_S4();
        }
        return str;
    };

	X.rand = function(under, over){ 
		switch(arguments.length){ 
			case 1: return parseInt(Math.random()*under+1); 
			case 2: return parseInt(Math.random()*(over-under+1) + under); 
			default: return 0; 
		} 
	};

    /**
     * 判断对象类型
     * @param o : *
     * @param type : String(String|Number|Object|Array|...)
     * @returns {boolean}
     */
    X.instanceOf = function(o,type){
        return toString.apply(o) === ('[object ' + type + ']') || typeof o === type.toLowerCase();
    };

    /**
     * 字符串格式化
     * @returns {*}
     */
    X.stringFormat = function(){
        if (arguments.length < 2) return;
        var str = arguments[0];
        if (arguments.length == 2 && X.instanceOf(arguments[1],'Array')){
            var args = arguments[1];
            for(var i = 1; i <= args.length; i++){
                var regx = new RegExp('\\{' + i + '\\}','g');
                str = str.replace(regx,args[i - 1]);
            }
        }else{
            for(var i = 1; i < arguments.length; i++){
                var regx = new RegExp('\\{' + i + '\\}','g');
                str = str.replace(regx,arguments[i]);
            }
        }
        return str;
    };
    
    /**
     * 随机字符串
     * @param n : Number(字符串长度)
     * @returns {string}
     * @constructor
     */
    X.UID = function(n){
        var s=[];
        for (var i=0;i<n;i++){
            var a=parseInt(X.random(0,25))+(Math.random()>0.5?65:97);
            s[i]=Math.random()>0.5?parseInt(Math.random()*9):String.fromCharCode(a);
        }
        return s.join("");
    };

    X.timeTo = function (day,hour,minute) {
        var now = new Date((G.time + (day || 0) * 24 * 3600) * 1000);
        now.setHours(hour || 0);
        now.setMinutes(minute || 0);
        now.setSeconds(0);
        return now;
    };

	X.time = function(){
		return Math.round(new Date().getTime()/1000);
	};
    /**
     * 时间差格式化
     * @param t1
     * @param t2
     * @returns {string}
     */
    X.timeFormat = function(t1,t2){
        var s = '刚刚'
            ,a = Math.abs(t2 - t1);
        if (t2 >= t1 && t1 > 0){
            if (a >= 86400){
                var t = Math.floor(a/86400);
                if (t > 3) t = 3;
                s = t + '天前';
            }else if(a >= 3600){
                s = Math.floor(a/3600) + '小时前';
            }else if (a >= 60){
                s = Math.floor(a/60) + '分钟前';
            }
        }else if (typeof t2 == 'string' || t2 == undefined){
            var formater = t2 || '{1}-{2}-{3} {4}:{5}:{6}';
            var t = new Date(t1);
            var y = t.getFullYear();
            var m = t.getMonth() + 1;
            var d = t.getDate();
            var h = t.getHours();
            var mm = t.getMinutes();
            var s = t.getSeconds();
            if (mm < 10) mm = '0' + mm;
            if (s < 10) s = '0' + s;
            return X.stringFormat(formater,y,m,d,h,mm,s);
        }else if (t1 == 0){
            if (t2 > 24*60*60){
                return X.stringFormat('{1}日{2}小时' ,Math.floor(t2/(3600*24)),Math.floor(t2/3600)%24);
            }else if (t2 >= 60*60){
                return X.stringFormat('{1}小时{2}分',Math.floor(t2/3600),Math.floor(t2/60)%60);
            }else{
                return X.stringFormat('{1}分{2}秒',Math.floor(t2/60)%60,t2%60);
            }
        }else if (t1 == -1){
            if (t2 > 24*60*60){
                return X.stringFormat('{1}日' ,Math.floor(t2/(3600*24)));
            }else if (t2 >= 60*60){
                return X.stringFormat('{1}小时',Math.floor(t2/3600));
            }else{
                return X.stringFormat('{1}分',Math.floor(t2/60)%60);
            }
        }else{
            if (a >= 86400){
                s = '还有' + Math.floor(a/86400) + '天';
            }else if(a >= 3600){
                s = '还有' + Math.floor(a/3600) + '小时';
            }else if (a >= 60){
                s = '还有' + Math.floor(a/60) + '分钟';
            }
        }
        return s;
    };

    //数组内元素 随机
    X.arrayRand = function (arr){
        return arr[X.rand(0,arr.length-1)];
    };

    /**
     * 是否在数组中
     * @param array : Array
     * @param item : Object
     * @returns {boolean}
     */
    X.inArray = function(array,item){
        if (!array) return false;
        var a = ',' + array.join(',') + ',';
        return a.indexOf(',' + item + ',') > -1;
    };

    /**
     * 在数组中找，返回下标，如果没有返回-1
     * @param array : Array
     * @param item : Object
     * @param key : String
     * @returns {number}
     */
    X.arrayFind = function(array,item,key){
        var idx = -1;
        for(var i = 0; i < array.length; i++){
            if (array[i] == item || array[i][key] == item){
                idx = i;
                break;
            }
        }
        return idx;
    };

    //数组根据相关条件排序
    X.sortArrayByIndex = function(array,index){
        array.sort(function(a,b){
            return a[index] - b[index];
        });
    };

    //数组洗牌，随机排序
    X.arrayShuffle = function(arr){
        for (var i = arr.length - 1; i > 0; i--) {
            var j = 0|(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }  
        return arr;
    };

    /**
     * 将数组中的某个元素向前或向后移
     * @param array
     * @param item
     * @param to >0 向后移 ; <0向前移
     */
    X.arrayMoveItemTo = function (array, item, to) {
        var idx = X.arrayFind(array,item);
        array.splice(idx,1);
        array.splice(idx + to,0,item);
        return array;
    };

    //移除数组中指定元素
    X.arrayRemove = function (array, d) {
        array.splice(array.indexOf(d),1)
        return array;
    };

    X.isArray = function(ar) {
        return Array.isArray(ar);
    };

    //数组中最大值
    X.arrayForMax = function (array,key)   {
        array.sort(function (a, b) {
            if (key){
                return b[key] - a[key];
            }
            return b - a;
        });
        return array[0];
    };

    //数组中最小值
    X.arrayForMin = function (array,key)   {
        array.sort(function (a, b) {
            if (key){
                return a[key] - b[key];
            }
            return a - b;
        });
        return array[0];
    };

    X.toFixed = function (v,n) {
        if ((v + '').indexOf('.') > 0)
            return v.toFixed(n);
        else
            return v;
    };
	
	X.isNumber = function(arg) {
		return typeof arg === 'number';
	};
	
    /**
     * 找到所有key
     * @param object
     * @returns {Array}
    */ 
    X.keysOfObject = function(object){
    	if(Object.keys){
    		return object==null?[]:Object.keys(object);
    	}else{
	        var keys = [];
	        if (object){
	            for(var key in object){
	                keys.push(key);
	            }
	        }
	        return keys;
		}
    };

    X.getFileJSON = function(file,callback){
        cc.loader.load(file,function(err,res){
            callback && callback(res[0]);
        });
    };

    X.clone = function(v){
        if (!v) return;
        var b;
        if (X.instanceOf(v,'Array')){
            b = [];
            for(var i = 0; i < v.length; i++){
                b.push(X.clone(v[i]));
            }
        }
        else{
            b = v.constructor ? new v.constructor : {};
            for(var k in v){
                var d = v[k];
                b[k] = (X.instanceOf(d,"Object") || X.instanceOf(d,"Array")) && d && !(d instanceof cc.Node) ? X.clone(d) : d;
            }
        }
        return b || v;
    };

    X.timeout = function(target,node,v,endcall,stepcall,intr1,intr2){
        if (!v || v <= 0) return;
        var n = v;
        var i = n;

        return target.setTimeout(function(){
            i--;
            if (i < 0){
                endcall && endcall();
                return;
            }
            var hour = Math.floor(i/3600);
            var minute = Math.floor((i%3600)/60);
            var second = (i%3600)%60;
            stepcall && stepcall(second,minute,hour);
            if (minute < 0) minute = 0;
            if (second < 0) second = 0;
            if (minute < 10) minute = '0' + minute;
            if (second < 10) second = '0' + second;
            var formatStr = (intr1 || '') + '{1}:{2}:{3}' + (intr2 || '');
            if (hour == 0) formatStr = (intr1 || '') + '{2}:{3}' + (intr2 || '');
            node.setString(X.STR(formatStr,hour,minute,second));//剩余时间
        },1000,n,1);
    };

    //将 2015-8-12 15:00:00 这样的字符串，转为DATA型
    X.str2Date = function(str){
        return new Date(Date.parse(str.replace(/-/g,"/")));
    };

    X.random = function (min, max) {
        return min + Math.random() * (max - min);
    };

    X.clipString = function (str, len) {
        if (str.length > len){
            var s = str.substr(0,len) + '...';
            return s;
        }else{
            return str;
        }
    }

    //默认字体大小
    X.BASE_FONT_SIZE = 24;
    //默认字体名
    X.BASE_FONT_NAME = (C.isJSB?'arial':'微软雅黑');

})();

function L(str){
    if(LNG[str]){
        return LNG[str];    
    }else{
        return null;
    }
};
