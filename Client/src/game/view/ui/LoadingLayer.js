/**
 * Created by jfwang on 2017-07-27.
 * 等待-Layer
 */

var LoadingLayer = X.bUi.extend({
	ctor: function (json,id) {
        var me = this;
        me._super(json,id);
    },
	onOpen : function(){
		var me = this;
		me.fillSize();

		var autoRemoveTime = me.data();
		me._autoRemoveTime = autoRemoveTime || 5000;
	},
	hide : function(){
		var me = this;
		if(me.isOpen && me.ui) me.remove();
	},
	onShow : function(){
		var me = this;

		me.ui.setTimeout(function(){
			me.hide();
		},me._autoRemoveTime);

		X.armature.create('armature/common/loading.ExportJson','loading',function(node){
			me.ui && me.ui.find('jzmc').addChild(node);
		});
	},
	onClose : function(){
		if (this.onLeave) this.onLeave();
	}

});

//实例化接口
LoadingLayer.create = function(){
    var ID = "LoadingLayer";
    var layer = new LoadingLayer('LoadingLayer.json',ID);
    
    //ui加入到frame管理器
    X.addFrame(ID,layer);

    layer.show();
    return layer;
};
