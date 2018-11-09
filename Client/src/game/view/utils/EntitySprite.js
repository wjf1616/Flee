var EntitySprite = cc.Layer.extend({
	_gameLayer:null,
	_bonenum:0,
	_shortestPath:[],//最短路径
	_spOpenSteps:[],//开放列表
	_spClosedSteps:[],//关闭列表
	_speed:10,
	_direction:"down",

	ctor:function(strName,target){
		this._super();
		this._gameLayer = target;

		var widget = this;
		X.armature.create(X.stringFormat("armature/entity/{1}.ExportJson",strName),strName,function(node){
			widget.addChild(node);
			widget.body = node;

			//人物自定义事件分流
			node.onFrameEvent(function(bone,event,originIndex,curIndex){
				//me.customPlayerEvent(event);
            });

			node.onMovementEvent(function(armature, movementType, movementID){
                //事件完成
				if (movementType==1) {
					//me.playerActionMovementEvent(movementID);
				};
            });
		});

		//停止动画
		widget.stop = function(){
			if (this.body) {
				this.body.getAnimation().stop();
			};
		};

		//播放动画
		widget.play = function(v){
			if (this.body && this.body.getAnimation().getCurrentMovementID() != v ) {
				this.body.getAnimation().play(v);
			}
		};

		//暂停动画
		widget.pause = function(){
			if (this.body) {
				this.body.getAnimation().pause();
			};
		};

		//继续播放动画 
		widget.resume = function(){
			if (this.body) {
				this.body.getAnimation().resume();
			};
		};
		this.play("stand_"+this._direction);

		return true;
	},
	
	moveToward:function(target){
		var fromTileCoord = this._gameLayer.tileCoordForPosition(this.getPosition());
		var toTileCoord = this._gameLayer.tileCoordForPosition(target);
		
		//位置无变化
		if(toTileCoord.x == fromTileCoord.x&&toTileCoord.y==fromTileCoord.y){
			return;
		}

		//是否可行走到目标点
		if(!this._gameLayer.isValidTileCoord(toTileCoord) || !this._gameLayer.isWalkAtTileCoord(toTileCoord)){
			return;
		}

		cc.log("From:	" + fromTileCoord.x + "	"+ fromTileCoord.y);
		cc.log("To:	" + toTileCoord.x + "	"+ toTileCoord.y);
		
		this._spOpenSteps = [];
		this._spClosedSteps = [];
		// 首先，添加Entity的方块坐标到open列表
		this.insertInOpenSteps(ShortestPathStep.create(fromTileCoord));
		do{
			//这里要当心死循环		
			var currentStep = this._spOpenSteps[0];	
			//cc.log("currentStep:"+currentStep.getPosition().x+"  "+currentStep.getPosition().y);

			// 添加当前步骤到closed列表
			this._spClosedSteps.push(currentStep);

			// 将它从open列表里面移除
			this._spOpenSteps.splice(0,1);
			
			// 如果当前步骤是目标方块坐标，那么就完成了
			if (toTileCoord.x == currentStep.x && toTileCoord.y==currentStep.y){
				this.constructPathAndStartAnimationFromStep(currentStep);
				this._spOpenSteps = [];
				this._spClosedSteps = [];
				break;		
			}

			var adjSteps = this._gameLayer.walkableAdjacentTilesCoordForTileCoord(currentStep.getPosition());
			for (var i = 0; i < adjSteps.length; ++i){
				var step = ShortestPathStep.create(adjSteps[i]);
				if (this.indexOf(this._spClosedSteps,step)!=-1){
					continue;
				}
				var moveCost = this.costToMoveFromStepToAdjacentStep(currentStep, step);
				var index = this.indexOf(this._spOpenSteps,step);
				if (index == -1){
					step.setParent(currentStep);
					step.setGScore(currentStep.getGScore() + moveCost);
					step.setHScore(this.computeHScoreFromCoordToCoord(step.getPosition(), toTileCoord));
					this.insertInOpenSteps(step);
				}else{
					step = this._spOpenSteps[index];
					if ((currentStep.getGScore() + moveCost) < step.getGScore()){
						step.setGScore(currentStep.getGScore() + moveCost);
						this._spOpenSteps.splice(index,1);

						// 重新按序插入
						this.insertInOpenSteps(step);
					}
				}
			}
		}while (this._spOpenSteps.length > 0);

		//打印寻路坐标
		// for (var i = 0;i<this._shortestPath.length;i++){
		// 	cc.log("Description:", this._shortestPath[i].getDescription());
		// }		

	},
	
	//用来判断step所在位置
	indexOf:function(array,step){
		if(array.length>0){
			for(var i = 0;i<array.length;i++){
				if(array[i].isEqual(step)){
					return i;
				}
			}
		}
		return -1;
	},
	
	//插入一个step  维护一个有序列表
	insertInOpenSteps:function(step){
		var stepFScore = step.getFScore();
		var count = this._spOpenSteps.length;
		var i ;
		for (i = 0; i < count; ++i){
			if (stepFScore <= this._spOpenSteps[i].getFScore()){
				break;
			}
		}

		this._spOpenSteps.splice(i, 0, step);
	},
	
	//计算H值
	computeHScoreFromCoordToCoord:function(fromCoord,toCoord){
		// 这里使用曼哈顿方法，计算从当前步骤到达目标步骤，在水平和垂直方向总的步数
		// 忽略了可能在路上的各种障碍
		return Math.abs(toCoord.x - fromCoord.x) +  Math.abs(toCoord.y - fromCoord.y);
	},

	//这里可以扩展~
	costToMoveFromStepToAdjacentStep:function(fromStep,toStep){
		// return ((fromStep.getPosition().x != toStep.getPosition().x)
		// 	&& (fromStep.getPosition().y != toStep.getPosition().y)) ? 14 : 10;

		return -1;
	},
	
	//构造最短路径
	constructPathAndStartAnimationFromStep:function(step){
		this._shortestPath=[];
		do{
			// 起始位置不要进行添加
			if (step.getParent()){

				// 总是插入到索引0的位置，以便反转路径
				this._shortestPath.splice(0,0,step); 
			}

			step = step.getParent();   // 倒退
		} while (step);                // 直到没有上一步

		this.popStepAndAnimate();
	},

	//获取方向
	getDirection: function(futpos,curpos) {
		var diff = cc.pSub(futpos,curpos);

		var direction = this._direction;
		if (diff.x > 0) {
			if (diff.y>0) {
				direction = 'rightup';
			}
			else if (diff.y==0) {
				direction = 'right';
			}
			else
			{
				direction = 'rightdown';
			}
		}
		else if (diff.x==0) {
			if (diff.y>0) {
				direction = 'down';
			}
			else if (diff.y==0) {
				direction = this._direction;
			}
			else
			{
				direction = 'up';
			}
		}
		else
		{
			if (diff.y>0) {
				direction = 'leftup';
			}
			else if (diff.y==0) {
				direction = 'left';
			}
			else
			{
				direction = 'leftdown';
			}
		}

		return direction;
	},

	//展示运动
	popStepAndAnimate:function(){
		var currentPosition = this._gameLayer.tileCoordForPosition(this.getPosition());
		var step = this._shortestPath[0];
		if(!step) {
			this.play("stand_"+this._direction);
			return;
		}
		
		var futurePosition = step.getPosition();
		var direction = this.getDirection(futurePosition,currentPosition);
		this._direction = direction;
		this.play("run_"+direction);

		this.stopAllActions();
		var moveAction = cc.moveTo(1/this._speed,this._gameLayer.positionForTileCoord(step.getPosition()));
		this._shortestPath.splice(0,1);

		var moveCallback = cc.callFunc(this.popStepAndAnimate,this);
		this.runAction(cc.sequence(moveAction,moveCallback));
	}
});

//实例化接口
EntitySprite.create = function(strName,target){
    var layer = new EntitySprite(strName,target);
    
    return layer;
};
