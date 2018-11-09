/**
 * Created by jfwang on 2017-07-25.
 * 数据Proxy 注册
 */

var PrepModelCommand = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'controller.command.PrepModelCommand',
        parent:cc.GamePureMVC.SimpleCommand
    },
    // INSTANCE MEMBERS
    {
        /** @override */
        execute: function (notification)
        {
            cc.log('PrepModelCommand execute');
            this.facade.registerProxy(new MainCityProxy() );
            

        }
    },
    // STATIC MEMBERS
    {
        NAME: 'PrepModelCommand'
    }
);
