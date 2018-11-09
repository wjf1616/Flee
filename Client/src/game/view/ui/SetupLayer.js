/**
 * Created by jfwang on 2017-07-27.
 * 游戏设置-Layer
 */

var SetupLayer = X.bUi.extend({
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
        me.ui.finds("btn_guanbi").touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_ENDED){
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
SetupLayer.create = function(){
    var ID = "SetupLayer";
    var layer = new SetupLayer('SetupLayer.json',ID);
    
    //ui加入到frame管理器
    X.addFrame(ID,layer);

    layer.show();
    return layer;
};
