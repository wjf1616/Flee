/**
 * Created by jfwang on 2017-07-25.
 * Mediator 注册
 */

var PrepViewCommand = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'controller.command.PrepViewCommand',
        parent:cc.GamePureMVC.SimpleCommand
    },
    // INSTANCE MEMBERS
    {
        /** @override */
        execute: function (notification)
        {
            cc.log('PrepViewCommand execute');

            this.facade.registerMediator( new DirectorMediator() );
            this.facade.registerMediator( new SceneMediator() );
            this.facade.registerMediator( new DengluMediator() );
            this.facade.registerMediator( new CreateMediator() );
            this.facade.registerMediator( new WorldMediator() );
            this.facade.registerMediator( new MainCityMediator() );
            this.facade.registerMediator( new SetupMediator() );
            //this.facade.registerMediator( new LoadingMediator() );

        }
    },
    // STATIC MEMBERS
    {
        NAME: 'PrepViewCommand'
    }
);
