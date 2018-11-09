/**
 * Created by jfwang on 2017-07-27.
 * 创建角色-Mediator
 */

var WorldMediator = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'view.mediator.WorldMediator',
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
            
            var worldLayer = WorldLayer.create();
            me.viewComponent = worldLayer;
            
            worldLayer.onLeave = function() {
                C.log("WorldLayer....");
                me.sendNotification(cc.GamePureMVC.statemachine.StateMachine.ACTION, null, SceneAction.$('DENGLU_ACTION'));

                //置空view
                me.destroy();
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
        NAME: 'WorldMediator'
    }
);
