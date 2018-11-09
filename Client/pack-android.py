# -*- coding: utf-8 -*-
#!/usr/bin/python

#=============================================================================== 
# * Created by jfwang on 2017-01-12.
# * Android 自动打包脚本
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

from xml.dom import minidom
import codecs

import sys
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

# 不安装 or 安装
INSTALL = 0

# 设置分包名称
PACKAGENAME = "SCHEME_DEFAULT"

# 设置版本号
VERSION = "1.0.1"
VERCODE = "1.0"

SUBPROJNAME = ""
PROJNAME = SUBPROJNAME+"proj.android"

# json文件读取
def loadJson(filename):
    f = open(filename)
    data = json.load(f)
    f.close()
    return data

# 分包机制
PACKAGENAMES = loadJson(WORKDIR+"pack/AndroidConfig.json")

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
    global PACKAGENAME,SUBPROJNAME,PROJNAME,VERSION,VERCODE

    package = PACKAGENAMES[PACKAGENAME]
    print '分包配置: %s' % package

    SUBPROJNAME = package["name"]
    print '分包名称: %s' % SUBPROJNAME

    VERSION = package["version"]
    print '分包版本: %s' % VERSION

    VERCODE = package["vercode"]
    print '分包CODE: %s' % VERCODE

    PROJNAME = SUBPROJNAME+"proj.android"
    print '分包工程: %s' % PROJNAME



# 编译相关项目
def _runCMD ():
    handle = "compile"
    if INSTALL == 1:
        handle = "run"

    if DEBUG == 1:
        print "开启debug编译..."
        cmd = "%scocos %s -p android --ap %s --proj-dir %s -j 4" % (COCOSDIR,handle,"android-19",PROJDIR+PROJNAME)
    else:
        print "开启release编译..."
        cmd = "%scocos %s -p android --ap %s --proj-dir %s -m release -j 4" % (COCOSDIR,handle,"android-19",PROJDIR+PROJNAME)
    return cmd

# 修改版本号
def modifyVersion(filename, versionCode, versionName):
    doc = minidom.parse(filename)
    root = doc.documentElement

    root.setAttribute('android:versionCode', versionCode)
    root.setAttribute('android:versionName', versionName)

    f = file(filename, "w")

    writer = codecs.lookup('utf-8')[3](f)
    doc.writexml(writer, newl='', indent='', encoding='utf-8')
    writer.close()
    f.close()

# 配置版本号、code
def confRev():
    filepath = PROJDIR+PROJNAME+"/AndroidManifest.xml"
    modifyVersion(filepath,VERCODE,VERSION)

# 清除相关目录，重新编译
def removeCMD ():
    cmd = "rm -r -f "+PROJDIR+PROJNAME+"/assets"
    os.system(cmd)

    cmd = "rm -r -f "+PROJDIR+PROJNAME+"/bin"
    os.system(cmd)

    cmd = "rm -r -f "+PROJDIR+PROJNAME+"/obj"
    os.system(cmd)

#切换git工程
def gitClone():
    #切换本地分支
    os.system ('git checkout develop')
    os.system ('git pull')

    #clone代码
    #os.system ('git clone %s %s --depth 1'%("git@192.168.1.250:nvshen_client.git","/Users/zf/Documents/code"))

# 修改包名
def renameCMD():
    tempname = "-"+VERSION
    if SUBPROJNAME != "":
        tempname = "-"+SUBPROJNAME+VERSION

    if DEBUG == 1:
        old_name = WORKDIR+"simulator/android/ThreeCountries-debug.apk"
        name = "%s-debug%s.apk" % (GAMENAME,tempname)
        new_name = WORKDIR+"simulator/android/"+name
    else:
        old_name = WORKDIR+"publish/android/ThreeCountries-release-signed.apk"
        name = "%s-release%s.apk" % (GAMENAME,tempname)
        new_name = WORKDIR+"publish/android/"+name

    os.rename(old_name,new_name)

    # print "上传包到ftp..."
    # uploadfile(new_name,name)

    # print "测试邮件发送中..."
    # content = "FTP路径：/pub/新项目测试用/Android\n包名："+name
    # send_mail(mailto_list,"Android新包测试",content)

# 执行run命令
def runCMD ():
    if RESTART == 1:
        print "开始重新编译打包..."
        removeCMD()
    else:
        print "开始打包..."
        cmd = "rm -r -f "+PROJDIR+PROJNAME+"/assets"
        os.system(cmd)

    print "代码重新整合中..."
    auto.run()

    #执行打包命令
    print "项目打包中..."
    return _runCMD()

# 入口
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
    remotepath = "/pub/新项目测试用/Android"
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
    print '-s, --statechannel:  打包分类 -- 0:普通包(默认),   1:正式包'
    print '-r, --restart:       编译计划 -- 0:编译(默认),     1:重新编译'
    print '-d, --debug:         编译模式 -- 0:release,      1:debug(默认)'
    print '-i, --install:       是否安装 -- 0:不安装(默认),   1:安装'
    print '-p, --package:       分包策略选择'

def main(argv):
    initPath()
    try:
        opts, args = getopt.getopt(argv[1:], 'h:s:r:d:p:i:', ['help=', 'statechannel=', 'restart=', 'debug=','package=', 'install='])
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
        elif opt in ('-i', '--install'):
            global INSTALL
            INSTALL = int(arg)
            print 'INSTALL: %s' % INSTALL
        elif opt in ('-p', '--package'):
            global PACKAGENAME
            PACKAGENAME = str(arg)
            print 'PACKAGENAME: %s' % PACKAGENAME
        else:
            print '未获取到相关参数 -h 查看帮助信息'

    pack()
    sys.exit(0)

if __name__ == '__main__':
    main(sys.argv)



