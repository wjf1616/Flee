/**
 * Created by jfwang on 2017-07-26.
 * 主城数据proxy 用例
 */

var MainCityProxy = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'model.proxy.MainCityProxy',
        parent: cc.GamePureMVC.Proxy,

        constructor: function () {
            cc.GamePureMVC.Proxy.call(this);
        }
    },

    // INSTANCE MEMBERS
    {
        _life: 0,

        onRegister: function () {
            
        },

        initLife: function(life){
            this._life = life;
        },

        getLife: function (life) {
            return this._life;
        },

        setLife: function (life) {
            this._life = life;
        },

        incLife: function (cb) {
            this._life++;
        },

        decLife: function (cb) {
            this._life--;

            if (this._life <= 0) {
                this.sendNotification(puremvc.statemachine.StateMachine.ACTION, null, SceneAction.$('DENGLU_ACTION'));
            } else {
                if (cb) {
                    cb(this._life);
                }
            }

        }
    },
    // STATIC MEMBERS
    {
        NAME: 'MainCityProxy'
    }
);

