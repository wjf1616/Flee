/**
 * Created by jfwang on 2017-07-27.
 * ajax 封装
 */
(function(){
var jsonpID = 1;
var jsonp = function(options){
    var callbackName = 'jsonp' + (++jsonpID),
        script = document.createElement('script'),
        abort = function(){
            script.parentNode.removeChild(script);
            if (callbackName in window) delete window[callbackName];
            options.error && options.error();
        },
        xhr = { abort: abort }, abortTimeout;

    window[callbackName] = function(data){
        clearTimeout(abortTimeout);
        script.parentNode.removeChild(script);
        delete window[callbackName];
		G.frame.loading.hide();
        options.callback && options.callback(data);
    };

    script.src = options.url.replace(/=\?/, '=' + callbackName);
    document.getElementsByTagName('head')[0].appendChild(script);

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.abort();
    }, options.timeout);
};

//AJAX请求
X.ajax = {
	request : function(o){
		if (!o.hide) {
			G.frame.loading.show(10000);
		}
		
        if (!C.isJSB){
        	if(o.data){
        		var i = 0;
				for(var k in o.data){
					if (i == 0) {
						o.url += ("?"+k+"="+encodeURIComponent(o.data[k]));
					}
					else
					{
						o.url += ("&"+k+"="+encodeURIComponent(o.data[k]));
					}
					i++;
				}
			}
            o.url += '&callback=?';

            jsonp(o);
            return;
        }

		var xhr = new XMLHttpRequest();
		xhr.open('POST', o.url);
		
		xhr.onreadystatechange = function() {
			G.frame.loading.hide();
			var data = null;
			try{
				if(xhr.responseText) {
					data = JSON.parse(xhr.responseText);
				}
			}catch(e){}
			o.callback && o.callback(data,xhr.statusText);
        }
		
		var _form = [],_formText='';
		if(o.data){
			for(var k in o.data){
				_form.push(k + '='+ encodeURIComponent(o.data[k]));
			}
			_formText = _form.join('&');
		}

		if(_formText!=''){
			xhr.send(_formText);
		}else{
			xhr.send();
		}

	}
	,get : function(url,succCallback){ 
		return this.request({
			type : 'GET',
			url : url,
			callback : function(text,status){
				succCallback && succCallback(text);
			}
		});
	}
	,post : function(url,data,succCallback){
		return this.request({
			type : 'POST',
			url : url,
			data : data,
			callback : function(text,status){
				succCallback && succCallback(text);
			}
		});
	}
};

})();
