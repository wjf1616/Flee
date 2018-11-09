/**
 * Created by jfwang on 2017-07-27.
 * 主城-Layer
 */

var MainCityLayer = X.bUi.extend({
    ctor: function (json,id) {
        this._life = 0;
        this._super(json,id);
    },

    onOpen: function () {
        this.fillSize();
        this.onInit();
    },

    onInit : function(){
        var me = this;

        me.ui.finds("Button_1").touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_ENDED){
                C.log('离开游戏主城...');
                me.remove();

            }
        });

        me.ui.finds("Button_2").touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_ENDED){
                C.log('打开游戏设置...');
                if (me.onSetup) me.onSetup();

            }
        });

        me.ui.finds("Button_3").touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_ENDED){
                if (me.onKill) me.onKill();

            }
        });
    },
    
    onShow: function () {
        var me = this;


    },

    onHide: function () {
        var me = this;
        
    },

    showLife: function(life){
        this._life = life;
        C.log("life:"+this._life);
    },

    onClose: function () {
        if (this.onLeave) this.onLeave();
    }
});

//实例化接口
MainCityLayer.create = function(){
    var ID = "MainCityLayer";
    var layer = new MainCityLayer('MainCityLayer.json',ID);
    
    //ui加入到frame管理器
    X.addFrame(ID,layer);

    layer.show();
    return layer;
};
