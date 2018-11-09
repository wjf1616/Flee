/**
 * Created by jfwang on 2017-07-25.
 * mvc机制 - 入口
 */

var AppFacade = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'AppFacade',
        parent: cc.GamePureMVC.Facade,

        constructor: function (multitonKey) {
            cc.GamePureMVC.Facade.call(this, multitonKey);
        }
    },
    // INSTANCE MEMBERS
    {
        initializeController: function () {
            cc.GamePureMVC.Facade.prototype.initializeController.call(this);
            this.registerCommand(AppFacade.STARTUP, StartupCommand);
        },
        initializeModel: function () {
            cc.GamePureMVC.Facade.prototype.initializeModel.call(this);
        },
        initializeView: function () {
            cc.GamePureMVC.Facade.prototype.initializeView.call(this);
        },

        startup: function () {
            this.sendNotification(AppFacade.STARTUP);
        }
    },
    // STATIC MEMBERS
    {
        getInstance: function(multitonKey) {
            var instanceMap = cc.GamePureMVC.Facade.instanceMap;
            var instance = instanceMap[multitonKey];
            if(instance) {
                return instance;
            }
            return instanceMap[multitonKey] = new AppFacade(multitonKey);
        },
        NAME: 'AppFacade',
        STARTUP: 'Startup'
    }
);