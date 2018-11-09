#!/bin/sh     
  
m_appPath=""  
m_ipaPath=""  
m_showMessage="NO"  
  
make_app_to_ipa()  
{  
    app_path=$1  
    ipa_path=$2  
    if [ "$m_showMessage" == "YES" ]  
    then  
        /usr/bin/xcrun -sdk iphoneos PackageApplication -v "$app_path" -o "$ipa_path"  
    else  
        /usr/bin/xcrun  > /dev/null 2>&1 -sdk iphoneos PackageApplication -v "$app_path" -o "$ipa_path"  
    fi  
    echo "  >>>> 打包ipa完成：$ipa_path"  
}  
  
showHelp()  
{  
echo "Convert app to ipa"  
echo "optional arguments:"  
echo "  -h, help            show this help message and exit"  
echo "  -a, app             app file path "  
echo "  -i, ipa             ipa file path "  
echo "  -m,msg              display build message, {NO,YES}"  
exit  
}  
  
  
#// main--------------------------------  
until [ $# -eq 0 ]  
do  
    case $1 in  
    -a | app)  
        m_appPath=$2  
        shift  
        ;;  
    -i | ipa)  
        m_ipaPath=$2  
        shift  
        ;;  
    -m | msg)  
        m_showMessage=$2  
        shift  
        ;;  
    -h | help)  
        showHelp  
        ;;  
    *)  
            echo "error unknow args : $1"  
            ;;  
        esac  
      
    shift  
done  
  
#开始构建  
echo ">>>>>>>>>> Build Begin "  
make_app_to_ipa $m_appPath $m_ipaPath  
echo ">>>>>>>>>> Build Finished . " 