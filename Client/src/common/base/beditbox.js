/**
 * Created by jfwang on 2017-07-27.
 * 输入框
 */
(function(){
    X.editbox = {
        create : function(o){
            if(!cc.sys.isNative)return;

            o.setTouchEnabled(false);
            o.hide();

            if(cc.sys.isObjectValid(o._editBox)){
                //只更新内容
                o._editBox.setString(o.getString());
                return;
            }

            var box = o._editBox = new cc.EditBox(cc.size(o.width, o.height), new cc.Scale9Sprite("img/blank.png"));
            var _name = o.getName();
            box.setName(_name+"_editBox");

            box.x = o.x;
            box.y = o.y;
            box.anchorX = o.anchorX;
            box.anchorY = o.anchorY;
            box.zIndex = o.zIndex;

            box.setFontSize( o.getFontSize() );
            box.setFontColor( cc.color(o.color.r, o.color.g, o.color.b) );
            box.setPlaceholderFontSize( o.getFontSize() );
            box.setPlaceholderFontColor( cc.color(o.color.r, o.color.g, o.color.b) );
            box.setPlaceHolder(o.getPlaceHolder());

            box.setString(o.getString());

            box.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE );
            box.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
            box.setInputFlag(cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE);

            o.editBoxEditingDidBegin = function (editBox) {
                //cc.log('editBoxEditingDidBegin');
            };

            o.editBoxEditingDidEnd = function (editBox) {
                //cc.log('editBoxEditingDidEnd');
            };

            o.editBoxTextChanged = function (editBox, text) {
                //cc.log('editBoxTextChanged');
                this.setString( text );
            };

            o.editBoxReturn = function (editBox) {
                //cc.log('editBoxReturn');
                this.onInput && this.onInput(editBox.getString());
                this.setString( editBox.getString() );
            };
            box.setDelegate(o);
            o.getParent().addChild(box);
        }
    };
})();