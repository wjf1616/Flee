var ShortestPathStep = cc.Node.extend({
    _position: cc.p(0,0),
    _fGScore: 0,
    _fHScore: 0,
    _Parent: null,

    ctor:function(point){
        this._super();
        this._position = point;
    },

    setPos: function(pos){
        this._position = pos;
    },

    getPos: function(){
        return this._position;
    },

    setGScore: function(gsocre){
        this._fGScore = gsocre;
    },

    getGScore: function(){
        return this._fGScore;
    },

    setHScore: function(hsocre){
        this._fHScore = hsocre;
    },

    getHScore: function(){
        return this._fHScore;
    },

    isEqual: function(step){
        return cc.pointEqualToPoint(this._position,step.getPos());
    },

    getFScore: function(){
        return (this._fGScore+this._fHScore);
    },

    getDescription: function(){
        return X.stringFormat("pos=[{1},{2}]  g={3}  h={4}  f={5}",this.getPosition().x, this.getPosition().y,
            this.getGScore(), this.getHScore(), this.getFScore());
    }

});

//实例化接口
ShortestPathStep.create = function(point){
    var node = new ShortestPathStep(point);
    
    return node;
};
