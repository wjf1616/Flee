/**
 * Created by jfwang on 2017-07-27.
 * 等待-Mediator
 */

var LoadingMediator = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'view.mediator.LoadingMediator',
        parent: cc.GamePureMVC.Mediator,
        constructor: function() {
            cc.GamePureMVC.Mediator.call(this, this.constructor.NAME);
        }

    },
    // INSTANCE MEMBERS
    {
        /** @override */
        listNotificationInterests: function () {
            return [ ];
        },

        /** @override */
        handleNotification: function (note) {

        },

        /** @override */
        onRegister: function () {
        },

        /** @override */
        onRemove: function () {

        },
        init: function() {
            var me = this;
            //创建layer
            var loadingLayer = LoadingLayer.create();
            me.viewComponent = loadingLayer.ui;

            loadingLayer.onLeave = function() {
                C.log("LoadingLayer....");
                
                //置空view
                me.destroy();
            };

            var curScene = cc.director.getRunningScene();
            if (me.viewComponent) {
                curScene.addChild(me.viewComponent);
            }
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
        NAME: 'LoadingMediator'
    }
);
