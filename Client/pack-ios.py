# -*- coding: utf-8 -*-
#!/usr/bin/python

#=============================================================================== 
# * Created by jfwang on 2017-01-12.
# * IOS 自动打包脚本
#=============================================================================== 

from ftplib import FTP
from email.mime.text import MIMEText
import smtplib
import auto
import sys, getopt
import os, os.path
import time
import urllib2
import json

reload(sys)
sys.setdefaultencoding("utf-8")

# 打包相关路径配置
COCOSDIR = ""
WORKDIR = ""

PROJDIR = ""
SRCDIR = ""
GAMENAME = ""

# 是否重新编译 1：重新编译 0：编译
RESTART = 0

# 编译方式 debug 或者 release
DEBUG = 1

# 测试 or 正式（fix）
CHANNEL_STATE = 0

# 设置分包名称
PACKAGENAME = "SCHEME_DEFAULT"

# 设置版本号
VERSION = "1.0.1"
VERCODE = "1.0"

SUBPROJNAME = ""
SUBPROJSIGN = ""
PROJNAME = SUBPROJNAME+"proj.ios_mac"

# json文件读取
def loadJson(filename):
    f = open(filename)
    data = json.load(f)
    f.close()
    return data

# 分包机制
PACKAGENAMES = loadJson(WORKDIR+"pack/IosConfig.json")

# 测试邮件要发给谁，可发送多人
mailto_list=PACKAGENAMES["Tester"] 

#===============================================================================  
# 设置服务器，用户名、口令以及邮箱的后缀
mail_host="smtp.qq.com"  
mail_user="1059903909"  
mail_pass="kkulboervxtvbege"  
mail_postfix="qq.com"  

#===============================================================================  
# 	to_list:发给谁 
#   sub:主题 
#   content:内容
#  	send_mail("aaa@qq.com","sub","content")  
def send_mail(to_list,sub,content):
    me=mail_user+"<"+mail_user+"@"+mail_postfix+">"
    msg = MIMEText(content.encode('utf-8')) 
    msg['Subject'] = sub 
    msg['From'] = me 
    msg['To'] = ";".join(to_list) 
    try: 
        s = smtplib.SMTP_SSL(mail_host, 465) 
        s.set_debuglevel(1)
        s.login(mail_user,mail_pass) 
        s.sendmail(me, to_list, msg.as_string()) 
        s.close() 
        print "邮件发送成功"
    except Exception, e: 
        print "邮件发送失败：%s" % str(e)

def initPath():
    global COCOSDIR,WORKDIR,PROJDIR,SRCDIR,GAMENAME
    # 配置表
    figPath = sys.path[0]+"/pack/_config.json"
    print figPath

    fig = loadJson(figPath)
    if not fig:
        return

    COCOSDIR = fig["cocosdir"]
    WORKDIR = fig["projpath"]
    PROJDIR = WORKDIR+"frameworks/runtime-src/"
    SRCDIR = WORKDIR+"src"
    GAMENAME = fig["gamename"]

def _init():
    global PACKAGENAME,SUBPROJNAME,SUBPROJSIGN,PROJNAME,VERSION,VERCODE
    print '配置: %s' % PACKAGENAMES

    package = PACKAGENAMES[PACKAGENAME]
    print '分包配置: %s' % package

    SUBPROJNAME = package["name"]
    print '分包名称: %s' % SUBPROJNAME

    SUBPROJSIGN = package["sign"]
    print '分包证书: %s' % SUBPROJSIGN

    VERSION = package["version"]
    print '分包版本: %s' % VERSION

    VERCODE = package["vercode"]
    print '分包CODE: %s' % VERCODE

    PROJNAME = SUBPROJNAME+"proj.ios_mac"
    print '分包工程: %s' % PROJNAME

# 编译相关项目
# cocos compile -s ./projects/MyGame -p ios -m release --sign-identity "iPhone Distribution:xxxxxxxx"
def _runCMD ():
    if DEBUG == 1:
        print "开启debug编译..."
        return r''+COCOSDIR+"cocos compile --proj-dir "+PROJDIR+PROJNAME+" -m debug -p ios"+_getSign()
    else:
        print "开启release编译..."
        return r''+COCOSDIR+"cocos compile --proj-dir "+PROJDIR+PROJNAME+" -m release -p ios"+_getSign()

# 修改版本号
def modifyBundleVersion(filename, versionCode, versionName):
    os.system('/usr/libexec/PlistBuddy -c "Set:CFBundleVersion %s" %s'%(versionCode,filename))
    os.system('/usr/libexec/PlistBuddy -c "Set:CFBundleShortVersionString %s" %s'%(versionName,filename))

# 配置版本号、code
def confRev():
    filepath = PROJDIR+PROJNAME+"/ios/Info.plist"
    modifyBundleVersion(filepath,VERCODE,VERSION)

def _getSign():
    _sign = ""
    if SUBPROJSIGN != "":
        _sign = " --sign-identity "+"'"+SUBPROJSIGN+"'"
    return _sign

# 清除相关目录，重新编译
def removeCMD ():
    cmd = "rm -r -f "+PROJDIR+PROJNAME+"/build"
    os.system(cmd)

#切换git工程
def gitClone():
    #切换本地分支
    os.system ('git checkout develop')
    os.system ('git pull')

    #clone代码
    #os.system ('git clone %s %s --depth 1'%("git@192.168.1.250:nvshen_client.git","/Users/zf/Documents/code"))

# 修改包名
def _app2ipa():
    tempname = "-"+VERSION
    if SUBPROJNAME != "":
        tempname = "-"+SUBPROJNAME+VERSION

    if DEBUG == 1:
        app_name = WORKDIR+"simulator/ios/sanguo-mobile.app"
        name = "%s-debug%s.ipa" % (GAMENAME,tempname)
        ipa_name = WORKDIR+"simulator/ios/"+name
    else:
        app_name = WORKDIR+"publish/ios/sanguo-mobile.app"
        name = "%s-release%s.ipa" % (GAMENAME,tempname)
        ipa_name = WORKDIR+"publish/ios/"+name

    return r''+WORKDIR+"pack/app2ipa.sh -a "+app_name+" -i "+ipa_name,ipa_name,name

def renameCMD():
    cmd,pathname,name = _app2ipa()
    os.system(cmd)

    #上传到ftp
    # print "上传包到ftp..."
    # uploadfile(pathname,name)

    # print "测试邮件发送中..."
    # content = "FTP路径：/pub/新项目测试用/IOS\n包名："+name
    # send_mail(mailto_list,"IOS新包测试",content)

# 执行run命令
def runCMD ():
    if RESTART == 1:
        print "开始重新编译打包..."
        removeCMD()
    else:
        print "开始打包..."

    print "代码重新整合中..."
    auto.run()

    #执行打包命令
    print "项目打包中..."
    return _runCMD()

# 打包接口
def pack():
    _init()
    confRev()
    res = os.system(runCMD())
    print "执行结果：%s" % res
    if res == 0:
        print "修改包名..."
        renameCMD()

# 上传包到ftp
def ftpconnect():
    ftp_server = '192.168.1.250'
    username = ''
    password = ''
    ftp=FTP()

    #打开调试级别2，显示详细信息
    ftp.set_debuglevel(2) 

    #连接
    ftp.connect(ftp_server, 21) 

    #登录，如果匿名登录则用空串代替即可
    ftp.login(username, password) 
    return ftp

def uploadfile(pathname,filename):
    remotepath = "/pub/新项目测试用/IOS"
    ftp = ftpconnect()
    ftp.cwd(remotepath)
    bufsize = 1024

    #(换成自己的文件路径)
    localpath = pathname 
    fp = open(localpath, 'rb')

    #（这绝对是个大坑，就没有看到文章解释清楚的，这边是上传到ftp服务器的文件名。不要用localpath来拼）
    send_cmd = 'STOR '+filename 
    ftp.storbinary(send_cmd, fp)
    ftp.set_debuglevel(0)

    #关闭文件
    fp.close() 
    ftp.quit()


def usage():
    print '-h, --help:          查看帮助信息'
    print '-s, --statechannel:  打包分类 -- 0:普通包(默认),1:正式包'
    print '-r, --restart:       编译计划 -- 0:编译(默认),1:重新编译'
    print '-d, --debug:         编译模式 -- 0:release,1:debug(默认)'
    print '-p, --package:       分包策略选择'

def main(argv):
    initPath()
    try:
        opts, args = getopt.getopt(argv[1:], 'h:s:r:d:p:', ['help=', 'statechannel=', 'restart=', 'debug=','package='])
    except getopt.GetoptError, err:
        print str(err)
        usage()
        sys.exit(1)

    print '传入参数: %s' % opts
    for opt, arg in opts:
        if opt in ('-h', '--help'):
            usage()
            sys.exit(0)
        elif opt in ('-s', '--statechannel'):
            global CHANNEL_STATE
            CHANNEL_STATE = int(arg)
            print 'CHANNEL_STATE: %s' % CHANNEL_STATE
        elif opt in ('-r', '--restart'):
            global RESTART
            RESTART = int(arg)
            print 'RESTART: %s' % RESTART
        elif opt in ('-d', '--debug'):
            global DEBUG
            DEBUG = int(arg)
            print 'DEBUG: %s' % DEBUG
        elif opt in ('-p', '--package'):
            global PACKAGENAME
            PACKAGENAME = str(arg)
            print 'PACKAGENAME: %s' % PACKAGENAME
        else:
            print '未获取到相关参数 -h 查看帮助信息'

    pack()

if __name__ == '__main__':
    main(sys.argv)



