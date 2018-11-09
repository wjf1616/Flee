/**
 * Created by jfwang on 2017-07-27.
 * 登陆-Mediator
 */

var DengluMediator = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'view.mediator.DengluMediator',
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
            
            //创建登陆layer
            var dengluLayer = DengluLayer.create();
            me.viewComponent = dengluLayer.ui;
            
            dengluLayer.onLeave = function() {
                C.log("DengluLayer....");
                me.sendNotification(cc.GamePureMVC.statemachine.StateMachine.ACTION, null, SceneAction.$('WORLD_ACTION'));
                //me.sendNotification(cc.GamePureMVC.statemachine.StateMachine.ACTION, null, SceneAction.$('CREATE_ACTION'));

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
        NAME: 'DengluMediator'
    }
);
