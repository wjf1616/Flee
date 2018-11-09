/**
 * Created by jfwang on 2017-07-25.
 * PrepControllerCommand
 */

var PrepControllerCommand = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'controller.command.PrepControllerCommand',
        parent:cc.GamePureMVC.SimpleCommand
    },
    // INSTANCE MEMBERS
    {
        /** @override */
        execute: function (notification)
        {
            cc.log('PrepControllerCommand execute');
        }
    },
    // STATIC MEMBERS
    {
        NAME: 'PrepControllerCommand'
    }
);
