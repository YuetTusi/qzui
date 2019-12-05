## 配置文件说明

配置项|类型|说明
:--|:--|:--
devPageUrl|string|本地开发页面
title|string|UI左上角标题
windowHeight|number|窗口默认高度
windowWidth|number|窗口默认宽度
minHeight|number|最小高度
minWidth|number|最小宽度
isFullScreen|boolean|是否打开时全屏显示
autoHideMenuBar|boolean|是否隐藏默认菜单
center|boolean|是否居中显示
rpcUri|string|RPC地址，当程序中无参数会使用此处配置
replyPort|number|PRC反馈服务端口（使用HPROSE推送此配置废弃）
devApi|string|HTTP接口地址（开发）
prodApi|string|HTTP接口地址（生产）
casePath|string|案件默认路径（当首次启动使用此配置）
isShowRenderer|boolean|是否显示渲染进程窗口
publishPage|string|发布页面，打包发布时会引用此页面
logFile|string|日志文件路径
