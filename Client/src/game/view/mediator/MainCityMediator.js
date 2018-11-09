/**
 * Created by jfwang on 2017-07-27.
 * 主城-Mediator
 */

var MainCityMediator = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'view.mediator.MainCityMediator',
        parent: cc.GamePureMVC.Mediator,
        constructor: function() {
            cc.GamePureMVC.Mediator.call(this, this.constructor.NAME);
        }

    },
    // INSTANCE MEMBERS
    {
        _mainCityProxy: null,

        /** @override */
        listNotificationInterests: function () {
            return [ ];
        },

        /** @override */
        handleNotification: function (note) {

        },

        /** @override */
        onRegister: function () {
            this._mainCityProxy  = this.facade.retrieveProxy(MainCityProxy.NAME);
        },

        /** @override */
        onRemove: function () {
            if (this._mainCityProxy) {
                this.facade.removeProxy(MainCityProxy.NAME);
                this._mainCityProxy = null;
            }

        },

        init: function() {
            var me = this;
            
            //创建角色layer
            var mainCityLayer = MainCityLayer.create();
            me.viewComponent = mainCityLayer.ui;

            mainCityLayer.onLeave = function() {
                C.log("MainCityLayer....");
                me.sendNotification(cc.GamePureMVC.statemachine.StateMachine.ACTION, null, SceneAction.$('DENGLU_ACTION'));

                //置空view
                me.destroy();
            };

            mainCityLayer.onSetup = function() {
                C.log("MainCityLayer....");
                me.sendNotification("SETUP_MEDIATOR");
            };

            me._mainCityProxy.initLife(10);
            mainCityLayer._life = me._mainCityProxy.getLife();
            mainCityLayer.onKill = function() {
                var showLife = function (life) {
                    mainCityLayer.showLife(life);
                };

                me._mainCityProxy.decLife(showLife);
            };

        },
        destroy: function() {
            this.viewComponent = null;
        },
        getResource: function () {
            return null;
        }
    },
    // STATIC MEMBERS
    {
        NAME: 'MainCityMediator'
    }
);
