## 配置文件说明

配置项|类型|说明
:--|:--|:--
devPageUrl|string|本地开发页面
title|string|UI左上角标题
author|string|开发者
windowHeight|number|窗口默认高度
windowWidth|number|窗口默认宽度
minHeight|number|最小高度
minWidth|number|最小宽度
center|boolean|是否居中显示
max|number|采集数量（数字>=2,若为2路则要改less相关配置）
rpcUri|string|采集程序RPC地址
parsingUri|string|解析程序的PRC地址
publishPage|string|发布页面，打包发布时会引用此页面
logFile|string|日志文件路径