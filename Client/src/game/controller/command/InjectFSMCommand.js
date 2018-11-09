/**
 * Created by jfwang on 2017-07-25.
 * 游戏状态机 初始化
 */

var InjectFSMCommand = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'controller.command.InjectFSMCommand',
        parent:cc.GamePureMVC.SimpleCommand
    },
    // INSTANCE MEMBERS
    {
        /** @override */
        execute: function (notification)
        {
            cc.log('InjectFSMCommand execute');

            var sceneFsm = new SceneFsm();
            var fsm = sceneFsm.createFsm();

            var injector = new cc.GamePureMVC.statemachine.FSMInjector(fsm);
            injector.initializeNotifier(this.multitonKey);
            injector.inject();

        }
    },
    // STATIC MEMBERS
    {
        NAME: 'PrepControllerCommand'
    }
);
