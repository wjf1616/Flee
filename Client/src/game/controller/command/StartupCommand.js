/**
 * Created by jfwang on 2017-07-25.
 * 初始化
 */

var StartupCommand = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'controller.command.StartupCommand',
        parent:cc.GamePureMVC.MacroCommand
    },
    // INSTANCE MEMBERS
    {
        /** @override */
        initializeMacroCommand: function (notification)
        {
            this.addSubCommand(PrepModelCommand);
            this.addSubCommand(PrepViewCommand);
            this.addSubCommand(PrepControllerCommand);
            this.addSubCommand(InjectFSMCommand );

        }
    },
    // STATIC MEMBERS
    {
        NAME: 'StartupCommand'
    }
);
