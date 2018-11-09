/**
 * Created by jfwang on 2017-07-29.
 * js<->java  js<->oc 交互
 */
(function(){
    jsbHelper = {
        event : cc.EventEmitter.create()
    };
    jsbHelper.event.setMaxListeners(200);

    jsbHelper.callNative  = X.callNative = function(className,functionName,parms){
        //调用原生方法
        var v = parms;
        if(typeof(parms)!="string")v = JSON.stringify(parms);
		cc.log('callNative='+v);
        if(cc.sys.os == cc.sys.OS_IOS ){
            var ret = jsb.reflection.callStaticMethod(
                className||"RootViewController",
                functionName || "jsbHelper:",
                v
            );
            return ret;
        }else if( cc.sys.os == cc.sys.OS_ANDROID ){
            var _class = className;
            _class = _class||"AppActivity";

            if(_class.indexOf('/')==-1){
                _class = 'org/cocos2dx/javascript/'+_class;
            }

            var ret = jsb.reflection.callStaticMethod(
                _class,
                functionName || "jsbHelper",
                "(Ljava/lang/String;)Ljava/lang/String;",
                v
            );
            return ret;
        }
    };

})();
