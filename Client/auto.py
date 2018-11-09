# -*- coding: utf-8 -*-
#!/usr/bin/python

#=============================================================================== 
# * Created by jfwang on 2017-03-07.
# * project.json 自动加入文件
#=============================================================================== 
import sys
import os
import json

def store(filename,data):
    with open(filename, 'w') as json_file:
        json_file.write(json.dumps(data,ensure_ascii=False,indent=4))

def load(filename):
    with open(filename) as json_file:
        data = json.load(json_file)
        return data

def scan_files(directory,prefix=None,postfix=None,discard=None):
    files_list=[]
    strdiscard = "";
    for root, sub_dirs, files in os.walk(directory):
        for special_file in files:
            if postfix:
                if special_file.endswith(postfix):
                    if discard:
                        strdiscard = os.path.join(root,special_file)[4:]
                    else:
                        strdiscard = os.path.join(root,special_file)
                    files_list.append(strdiscard)
            elif prefix:
                if special_file.startswith(prefix):
                    if discard:
                        strdiscard = os.path.join(root,special_file)[4:]
                    else:
                        strdiscard = os.path.join(root,special_file)
                    files_list.append(strdiscard)
            else:
                if discard:
                    strdiscard = os.path.join(root,special_file)[4:]
                else:
                    strdiscard = os.path.join(root,special_file)
                files_list.append(strdiscard)

    # 排序一下
    files_list.sort()
    
    return files_list

def run():
    # 资源预加载
    resList = [".png",".jpg",".json",".ExportJson",".fnt",".tmx"]

    # 暂时用不到的文件，放入丢弃池
    discardlist = ["src/AutoConfig.js","src/resource.js","src/common.js","src/AssetsManager.js"]

    jsList = scan_files('src',postfix='.js')
    for fileName in discardlist:
        if fileName in jsList:
            jsList.remove(fileName)
    
    # 编辑jsFiles
    filetest = open("src/AutoConfig.js", "wb")
    filetest.write("var jsFiles = %s;" % json.dumps(jsList,ensure_ascii=False,indent=4))
    filetest.close()

    # 编辑g_resources
    restest = open("src/resource.js", "wb")
    resData = []
    for resfix in resList:
        resData.extend(scan_files('res',postfix=resfix,discard=True))
    restest.write("var g_resources = %s;" % json.dumps(resData,ensure_ascii=False,indent=4))
    restest.close()


    data = load("_project.json")
    data["jsList"] = discardlist

    # 编辑project.json
    store("project.json",data)

    
if __name__ == '__main__':
    run()