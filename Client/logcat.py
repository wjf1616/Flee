# -*- coding: utf-8 -*-
#!/usr/bin/python

import sys,getopt
import os.path

#问题：华为android7.0 看不到logcat
#进入拨号界面输入：*#*#2846579#*#*
#依次选择--后台设置----LOG设置，勾选相关log设置即可。
#adb logcat | grep cocos2d-x

#0:不过滤，全部信息,1:过滤cocos2dx信息,2:显示Error以上级别的日志
FILTER = 0

def logic():
	#清空logcat缓存
	cmd = "adb logcat -c"
	os.system(cmd)

	#清除原有的Log文件
	os.system(r'rm -r -f '+"log.txt")

	if FILTER == 1:
		#cmd = "adb logcat | grep %s" % "'^..cocos2d-x debug info'"
		cmd = "adb logcat | grep %s" % "cocos2d-x"
	elif FILTER == 2:
		cmd = "adb logcat *:E"
	elif FILTER == 3:
		cmd = "adb logcat > log.txt"
	else:
		cmd = "adb logcat -v tag"

	print cmd
	os.system(cmd)

def usage():
	print '-h, --help:  		查看帮助信息'
	print '-f, --filter:		过滤LOG	-- 0:不过滤，全部信息;1:过滤cocos2dx信息;2:Error日志;3:输出日志到log.txt'

def main(argv):
	try:
		opts, args = getopt.getopt(argv[1:], 'h:f:', ['help=', 'filter='])
	except getopt.GetoptError, err:
		print str(err)
		usage()
		sys.exit(1)

	print '传入参数: %s' % opts
	for opt, arg in opts:
		if opt in ('-h', '--help'):
			usage()
			sys.exit(0)
		elif opt in ('-f', '--filter'):
			global FILTER
			FILTER = int(arg)
			print 'FILTER: %s' % FILTER
		else:
			print '未获取到相关参数 -h 查看帮助信息'

	logic()

if __name__ == '__main__':
	main(sys.argv)
