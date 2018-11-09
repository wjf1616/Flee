/**
 * Created by jfwang on 2017-07-27.
 * 游戏设置-Mediator
 */

var SetupMediator = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'view.mediator.SetupMediator',
        parent: cc.GamePureMVC.Mediator,
        constructor: function() {
            cc.GamePureMVC.Mediator.call(this, this.constructor.NAME);
        }

    },
    // INSTANCE MEMBERS
    {
        /** @override */
        listNotificationInterests: function () {
            return [
                "SETUP_MEDIATOR"
            ];
        },

        /** @override */
        handleNotification: function (note) {
            switch (note.getName()) {
                case "SETUP_MEDIATOR":
                    this.init();
                    break;
            }
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
            var setupLayer = SetupLayer.create();
            me.viewComponent = setupLayer.ui;

            setupLayer.onLeave = function() {
                C.log("SetupLayer....");
                
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
        NAME: 'SetupMediator'
    }
);
