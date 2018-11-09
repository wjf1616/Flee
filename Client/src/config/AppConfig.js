C.DEBUG = cc.DEBUG = true;
C.USECSB = true;

//游戏全局命名
var G = {
	frame : {},

	hotUpdateUrl : "http://jlcq.daliplay.cn/jlcq_update/?app=hotupdate",
	serverListUrl : "http://xiyouq.twolong.cn/api/index.php?app=serverlist_jingling",
	login_url:'http://guaji.twolong.cn/api/user_login.php?account={1}&pwd={2}',
    quick_register_url: 'http://guaji.twolong.cn/api/user_new.php?',
    check_card_url: 'http://jlcqgm.daliplay.cn/?app=api.chkcard&gameid=heros&uid={1}&uname={2}&cnum={3}',
    
    event : cc.EventEmitter.create()
};

G.event.setMaxListeners(50000);
