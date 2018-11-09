var TiledMapLayer = cc.Layer.extend({
    _tileMap:null,
    _bgLayer:null,
    _hideLayer:null,
    _walkLayer:null,
    _player:null,
    _births:null,
    _npcs:null,
    _boss:null,
    _exit:null,

    bonesCount:null,
    ctor:function (tiledName) {
        // ////////////////////////////
        // 1. super init first
	    this._super();
	    // 加载地图
	    this._tileMap = new cc.TMXTiledMap(tiledName);
	    this._bgLayer = this._tileMap.getLayer("background");

	    this._walkLayer = this._tileMap.getLayer("walk");
        this._walkLayer.setVisible(false);

        this._hideLayer = this._tileMap.getLayer("hide");
        this._hideLayer.setVisible(false);

        this._births = this._tileMap.getObjectGroup('birth').getObjects();
        this._npcs = this._tileMap.getObjectGroup('npc').getObjects();
        this._boss = this._tileMap.getObjectGroup('boss').getObjects();
        this._exit = this._tileMap.getObjectGroup('exit').getObjects();

	    this.addChild(this._tileMap);
	    
	    // 25*25 tiles
	    cc.log("map size width:"+this._tileMap.getMapSize().width+";height:"+this._tileMap.getMapSize().height);
	    
	    // tile size: 32*32
	    cc.log("tile size width:"+this._tileMap.getTileSize().width+";height:"+this._tileMap.getTileSize().height);

	    // tile坐标
	    var spawnTileCoord = this._exit ? cc.p(this._exit[0].x,this._exit[0].y) : cc.p(0,0);
	    var spawnPos = this.positionForTileCoord(spawnTileCoord);
	    this.setViewpointCenter(spawnPos);
	    
	    cc.eventManager.addListener({
	    		event: cc.EventListener.TOUCH_ONE_BY_ONE,
	    		swallowTouches: true,
	    		onTouchBegan:function (touch, event) {
                    var _curTarget = event.getCurrentTarget();
                    if (_curTarget) {
                        var point = _curTarget._tileMap.convertTouchToNodeSpace(touch);
                        cc.log("touch point x:  "+point.x+"y:   "+point.y);

                        var _player = _curTarget._player;
                        if (_player) {
                            _player.moveToward(point);
                        }
                    }
	    			return true;
	    		}
	    }, this);
	    
	    this.scheduleUpdate();
        return true;
    },

    //添加主角
    addPlayer: function(strName){
        var index = X.rand(0,this._births.length);
        var spawnTileCoord = this.getBirth(index);
        this._player = EntitySprite.create(strName,this);
        this._player.setPosition(spawnTileCoord);
        this._tileMap.addChild(this._player);
    },

    //添加实体
    addEntity: function(){

    },

    //玩家出生点
    getBirth: function(index){
        if (index<0) {
            index = 0;
        }
        if (index>=this._births.length) {
            index = this._births.length-1;
        }
        var pos = cc.p(0,0);
        var birth = this._births[index];
        if (birth) {
            pos = cc.p(birth.x,birth.y);
        }
        return pos;
    },

    // 坐标转换为tile
    positionForTileCoord:function(p){
    	var x = (p.x * this._tileMap.getTileSize().width) + this._tileMap.getTileSize().width / 2;
    	var y = (this._tileMap.getMapSize().height *this. _tileMap.getTileSize().height) -
    	(p.y *this._tileMap.getTileSize().height) - this._tileMap.getTileSize().height / 2;
    	return cc.p(x, y);
    },
    
    // 地图跟随
    setViewpointCenter:function(position){
    	var size = cc.director.getWinSize();
    	var x = Math.max(position.x, size.width / 2);
    	var y = Math.max(position.y, size.height / 2);
    	x = Math.min(x, (this._tileMap.getMapSize().width * this._tileMap.getTileSize().width) - size.width / 2);
    	y = Math.min(y, (this._tileMap.getMapSize().height * this._tileMap.getTileSize().height) - size.height / 2);
    	var p = cc.p(x,y);
    	var center = cc.p(size.width/2,size.height/2);
    	var viewPoint = cc.pSub(center,p);

    	this._tileMap.setPosition(viewPoint);
    },

    // hide处理 （角色半透处理）
    translucentEntity: function(){

    },

    update:function(){
        if (this._player) {
            this.setViewpointCenter(this._player.getPosition());
        }
    },

    tileCoordForPosition:function(position){
    	var x = parseInt( position.x / this._tileMap.getTileSize().width);
    	var y = parseInt(((this._tileMap.getMapSize().height *this._tileMap.getTileSize().height) - position.y) / this._tileMap.getTileSize().height);
    	return cc.p(x, y);
    },

    //是否遮挡
    isHideAtTileCoord:function(tileCoord){
        return this.isPropAtTileCoordForLayer("trap2", tileCoord, this._hideLayer);
    },

    //是否可行走
    isWalkAtTileCoord:function(tileCoord){
    	return this.isPropAtTileCoordForLayer("trap1", tileCoord, this._walkLayer);
    },

    //边界处理
    isValidTileCoord:function(tileCoord){
    	if (tileCoord.x < 0 || tileCoord.y < 0 ||
    			tileCoord.x >= this._tileMap.getMapSize().width ||
    			tileCoord.y >= this._tileMap.getMapSize().height)
    	{
    		return false;
    	}
    	else
    	{
    		return true;
    	}
    },
    
    //判断point是否在layer上
    isPropAtTileCoordForLayer:function(prop,tileCoord,layer){
    	if (!this.isValidTileCoord(tileCoord)){
    		return false;
    	}
    	
    	//获得tile对应id
    	var gid = layer.getTileGIDAt(tileCoord);
    	if (!gid){
    		return false;
    	}
    	return true;
    },

    //是否可以通过
    walkableAdjacentTilesCoordForTileCoord:function(tileCoord){
    		var tmp = [];
    		// 上
    		var p1=cc.p(tileCoord.x, tileCoord.y - 1);
    		if (this.isValidTileCoord(p1) && this.isWalkAtTileCoord(p1)){
    			tmp.push(p1);
    		}

    		// 左
    		var p2=cc.p(tileCoord.x - 1, tileCoord.y);    		
    		if (this.isValidTileCoord(p2) && this.isWalkAtTileCoord(p2)){
    			tmp.push(p2);
    		}

    		// 下
    		var p3=cc.p(tileCoord.x, tileCoord.y + 1);    
    		if (this.isValidTileCoord(p3) && this.isWalkAtTileCoord(p3)){
    			tmp.push(p3);
    		}

    		// 右
    		var p4=cc.p(tileCoord.x + 1, tileCoord.y);    
    		if (this.isValidTileCoord(p4) && this.isWalkAtTileCoord(p4)){
    			tmp.push(p4);
    		}

    		// cc.log("tileCoord: "+tileCoord.x+" "+tileCoord.y);
    		// for(var i = 0;i<tmp.length;i++){
    		// 	cc.log("tmp "+i+":	"+tmp[i].x+	"  "+tmp[i].y);
    		// }
    		return tmp;
    }
});


//实例化接口
TiledMapLayer.create = function(tiledName){
    var layer = new TiledMapLayer(tiledName);

    return layer;
};
