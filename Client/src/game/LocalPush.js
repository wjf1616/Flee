/**
 * Created by jfwang on 2017-07-26.
 * LocalPush 事件推送
 */

(function(){

var LocalPush = {
	set : function(conf){	
		/*
		设置本地本地通知
		showIfOnTop = 1 || 0 APP在前端时是否显示
		title = 标题，空为APP名
		content = 内容
		delay = 多少秒后提示
		id = 推送ID
		*/
		conf.title = conf.title||"";
		if(conf.showIfOnTop==null)conf.showIfOnTop="1";
		conf.showIfOnTop = conf.showIfOnTop.toString();
		conf.id = conf.id || X.rand(11111111,99999999);
		conf.act = "setNotify";
		console.log('setPush='+JSON.stringify(conf));

		try{
			if(C.isJSB) X.callNative(null,null,conf);
		}catch(e){}
	},
	remove : function(id){
		//移除本地通知
	}
};


function getDay(day,fromDay){
	var today = fromDay || new Date();
	var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;
	today.setTime(targetday_milliseconds);
	var tYear = today.getFullYear();
	var tMonth = today.getMonth();
	var tDate = today.getDate();
	tMonth = doHandleMonth(tMonth + 1);
	tDate = doHandleMonth(tDate);
	return tYear+"-"+tMonth+"-"+tDate;
}
function doHandleMonth(month){
	var m = month;
	if(month.toString().length == 1){
		m = "0" + month;
	}
	return m;
}
function str2Date(str){
	return new Date(Date.parse(str.replace(/-/g,"/")));
}

G.push = {
	regInit : function(){
		this.day2();
		this.day3();
		this.day6();
		//this.svr7();

	},
	day2 : function(){
		var day = str2Date(getDay(1)+" 09:00:00");
		var daySec = day.getTime()/1000;
		
		LocalPush.set({
			content : "XXXXXX",	
			delay : daySec-G.time,
			//repeat : 0
		});
	},
	day3 : function(){
		var day = str2Date( getDay(2)+" 09:00:00");
		var daySec = day.getTime()/1000;
		
		LocalPush.set({
			content : "XXXXXX",	
			delay : daySec-G.time,
			//repeat : 0
		});
	},
	day6 : function(){
		var day = str2Date( getDay(6)+" 09:00:00");
		var daySec = day.getTime()/1000;
		
		LocalPush.set({
			content : "XXXXXX",	
			delay : daySec-G.time,
			//repeat : 0
		});
	},
	worldboss : function(){
		if(!P.gud || P.gud.lv<30)return;

		var day = str2Date(getDay(0)+" 12:15:00");
		var daySec = day.getTime()/1000;
		if(daySec<=G.time)return;

		var cache_first_in = "worldboss"+ ((P && P.gud && P.gud.uid) || "");
        if(!X.cache(cache_first_in)){
            X.cache(cache_first_in,1);

            this._repeat(daySec-G.time,"XXXXXX");
        }
	},
	worldboss1 : function(){
		if(!P.gud || P.gud.lv<30)return;

		var day = str2Date(getDay(0)+" 19:15:00");
		var daySec = day.getTime()/1000;
		if(daySec<=G.time)return;

		var cache_first_in = "worldboss1"+ ((P && P.gud && P.gud.uid) || "");
        if(!X.cache(cache_first_in)){
            X.cache(cache_first_in,1);

			this._repeat(daySec-G.time,"XXXXXX");
		}
	},
	_repeat : function(t1,info){
		LocalPush.set({
			content : info,	
			delay : t1,
			//repeat : 1
		});
	},
	svr7 : function(){
		if(!P.gud)return;
		var openTime = str2Date( (P.gud.opentime.split(' ')[0])+' 00:00:00' );
		
		var day = str2Date(getDay(6,openTime));
		var daySec = day.getTime()/1000;
		
		if(daySec<=G.time)return;
		LocalPush.set({
			content : "XXXXXX",	
			delay : daySec-G.time,
			//repeat : 0
		});
		
	}

};
	
})();