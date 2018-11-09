/**
 * Created by jfwang on 2017-07-27.
 * 登陆-Layer
 */

var DengluLayer = X.bUi.extend({
    ctor: function (json,id) {
        var me = this;
        me._super(json,id);
    },

    onOpen: function () {
        var me = this;
        me.fillSize();

        me.onInit();
    },

    onInit : function(){
        var me = this;
        me.ui.finds("Button_1").touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_ENDED){
                C.log('开始游戏...');
                me.remove();

            }
        });
    },
    
    onShow: function () {
        var me = this;


    },

    onHide: function () {
        var me = this;
        
    },

    onClose: function () {
        if (this.onLeave) this.onLeave();
    }
});

//实例化接口
DengluLayer.create = function(){
    var ID = "DengluLayer";
    var layer = new DengluLayer('DengluLayer.json',ID);
    
    //ui加入到frame管理器
    X.addFrame(ID,layer);

    layer.show();
    return layer;
};