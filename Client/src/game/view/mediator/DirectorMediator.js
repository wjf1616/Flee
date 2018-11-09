/**
 * Created by jfwang on 2017-07-27.
 * 导演-Mediator
 */

var DirectorMediator = cc.GamePureMVC.define(
    // CLASS INFO
    {
        name: 'view.mediator.DirectorMediator',
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
                'SCENE_CHANGED'
            ];
        },

        /** @override */
        handleNotification: function (notification) {
            switch (notification.getName()) {
                case 'SCENE_CHANGED':
                    //cc.log('SCENE_CHANGED');
                    var sceneMediator = this.facade.retrieveMediator(SceneMediator.NAME);
                    if(sceneMediator && sceneMediator.getViewComponent()) {
                        cc.director.runScene(new cc.TransitionFade(1.2, sceneMediator.getViewComponent()));
                    }

                    break;
            }
        },

        /** @override */
        onRegister: function () {

        },

        /** @override */
        onRemove: function () {

        }
    },
    // STATIC MEMBERS
    {
        NAME: 'DirectorMediator'
    }
);
