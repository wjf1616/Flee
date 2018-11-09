/**
 * Created by jfwang on 2017-07-25.
 * 状态机
 */

var SceneFsm = cc.GeneJS.Class({
    'public createFsm': function() {
        var fsm = {
            // 开始状态
            "@initial": SceneState.$('DENGLU_MEDIATOR'),
            "state": [
                {
                    // 登陆
                    "@name": SceneState.$('DENGLU_MEDIATOR'),
                    //"@changed": SceneTransition,
                    "transition": [
                        {
                            "@action": SceneAction.$('CREATE_ACTION'),
                            "@target": SceneState.$('CREATE_MEDIATOR')
                        },
                        {
                            "@action": SceneAction.$('WORLD_ACTION'),
                            "@target": SceneState.$('WORLD_MEDIATOR')
                        },
                        {
                            "@action": SceneAction.$('MAINCITY_ACTION'),
                            "@target": SceneState.$('MAINCITY_MEDIATOR')
                        }
                    ]
                },
                {
                    // 创建角色
                    "@name": SceneState.$('CREATE_MEDIATOR'),
                    //"@changed": SceneTransition ,
                    "transition": [
                        {
                            "@action": SceneAction.$('MAINCITY_ACTION'),
                            "@target": SceneState.$('MAINCITY_MEDIATOR')
                        }
                    ]
                },
                {
                    // 主城
                    "@name": SceneState.$('MAINCITY_MEDIATOR'),
                    //"@changed": SceneTransition ,
                    "transition": [
                        {
                            "@action": SceneAction.$('DENGLU_ACTION'),
                            "@target": SceneState.$('DENGLU_MEDIATOR')
                        }
                    ]
                },
                {
                    // 世界场景
                    "@name": SceneState.$('WORLD_MEDIATOR'),
                    //"@changed": SceneTransition ,
                    "transition": [
                        {
                            "@action": SceneAction.$('DENGLU_ACTION'),
                            "@target": SceneState.$('DENGLU_MEDIATOR')
                        }
                    ]
                }
            ]
        };

        return fsm;
    }
});
