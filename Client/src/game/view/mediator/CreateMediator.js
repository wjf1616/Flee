/**
 * Created by jfwang on 2017-07-27.
 * 创建角色-Mediator
 */

var CreateMediator = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'view.mediator.CreateMediator',
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
            
            //创建角色layer
            var createLayer = CreateLayer.create();
            me.viewComponent = createLayer.ui;

            createLayer.onLeave = function() {
                C.log("CreateLayer....");
                me.sendNotification(cc.GamePureMVC.statemachine.StateMachine.ACTION, null, SceneAction.$('MAINCITY_ACTION'));

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
        NAME: 'CreateMediator'
    }
);
