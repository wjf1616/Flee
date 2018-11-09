var WorldLayer = cc.Layer.extend({
    _tiledMapLayer:null,

    ctor:function () {
	    this._super();

        //添加TildMap地图
        var tiledMapLayer = this._tiledMapLayer = TiledMapLayer.create("world/Test.tmx");
        this.addChild(tiledMapLayer);

        //添加主角
        this.addPlayer();

        //添加实体
        this.addEntity();

        return true;
    },
    
    addPlayer: function(){
        var me = this;
        if (!me._tiledMapLayer) {
            cc.log("创建场景失败.");
            return;
        }
        me._tiledMapLayer.addPlayer("fs_female");
    },

    addEntity: function(){
        
    }

});


//实例化接口
WorldLayer.create = function(){
    var layer = new WorldLayer();

    return layer;
};
