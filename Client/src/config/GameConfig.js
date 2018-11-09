var GC = {
	//语言包
	LNG_ARRAY : [
    	"lng.json",
    	"lng_complex.json",
    	"lng_english.json"
    ],
	//颜色
    COLOR : {
        0 : "#6a3906",
        1 : "#00ff00",
        2 : "#00deff",
        3 : "#fb45fd",
        4 : "#6a3906",
        5 : '#cd0005',
        6 : '#ff1dec',
        7 : '#00deff',
        8 : '#9931de',
        9 : '#6a3906',
        10 : '#ff3b7c',
        11 : '#00c50e'
    }

};

//引擎初始化完毕，搜索路径之类的初始化over
G.event.on('cocosReady',function(){
    X.getFileJSON('json/skill.json',function(d){
        GC.SKILL = d;
    });

    X.getFileJSON('json/figure.json',function(d){
        GC.FIGURE = d;
    });

    X.getFileJSON('json/item.json',function(d){
        GC.ITEM = d;
    });

});
