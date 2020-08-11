## Socket通信文档

目前前后台通讯通过Socket来完成，参数使用JSON格式。

### Socket分类

Socket分类使用枚举区分：

类别|名称|说明
---|---|---
采集|Fetch|采集程序的Socket名称
解析|Parse|解析程序的Socket名称

所有Socket通讯均有3个固定参数不可缺少，举例：

```json
{
    type: 'Fetch',
    cmd: 'connect',
    msg: 'success'
}
```
> 其中`type`表示Socket分类，`cmd`表示当前命令，`msg`为命令参数。


### 通信命令说明

#### 采集程序连入

Fetch命令：`connect`，无参数。

UI反馈命令`connect_ok`，参数：

参数名|类型|说明
---|---|---
count|number|当前采集路数

举例：

```json
{
    type: 'Fetch',
    cmd: 'connect_ok',
    msg: { count: 8 }
}
```

#### 用户警告

Fetch命令: `user_alert`

#### 设备连入

Fetch命令: `device_in`

Fetch参数：

参数名|类型|说明
---|---|---
manufacturer|string|手机制造商
model|string|型号
usb|number|序号
system|string|系统
fetchState|enum|状态枚举

#### 设备断开

Fetch命令: `device_out`

Fetch参数：

参数名|类型|说明
---|---|---
usb|number|序号


#### 设备状态更新

Fetch命令: `device_change`

Fetch参数：

参数名|类型|说明
---|---|---
usb|number|序号
fetchState|enum|状态枚举

#### 接收采集消息

Fetch命令: `tip_msg`

Fetch参数：

参数名|类型|说明
---|---|---
usb|number|序号
type|enum|消息枚举（闪烁消息,一般消息,iTunes密码提示）
title|string|标题
content|string|内容（与images二选一传递）
images|enum|图示枚举（与content二选一传递）
yesButton|object|是按钮
noButton|object|否按钮


当type为**iTunes密码提示**时 UI需反馈命令`tip_reply`，参数：

参数名|类型|说明
---|---|---
usb|number|序号
password|string|密码
type|number|用户按钮分类(1:密码确认，2:未知密码放弃，3:未知密码继续)

#### 清空采集消息

Fetch命令: `tip_clear`

Fetch参数：

参数名|类型|说明
---|---|---
usb|number|序号


#### 开始采集（取证）

UI命令：`start_fetch`，参数：

参数名|类型|说明
---|---|---
usb|number|序号
caseName|string|案件名称
casePath|string|案件绝对路径
appList|string[]|App包名
mobileName|string|手机名称
mobileHolder|string|手机持有人
note|string|备注
fetchType|string|采集方式
checkerName|string|检验员
checkerNo|string|检验员编号
unitName|string|检验单位
dstUnitName|string|送检单位
isAuto|boolean|是否自动解析


#### 停止采集（取证）

UI命令：`stop_fetch`，参数：

参数名|类型|说明
---|---|---
usb|number|序号


#### 采集进度

Fetch命令：`fetch_progress`，参数：

参数名|类型|说明
---|---|---
usb|number|序号
type|enum|进度分类
info|string|进度内容

#### 解析程序连入

Parse命令：`connect`，无参数。

#### 开始解析

UI命令：`start_parse`，参数：

参数名|类型|说明
---|---|---
caseId|string|案件id
deviceId|string|设备id
phonePath|string|手机绝对路径


#### 解析进度

Parse命令：`parse_curinfo`，参数：

参数名|类型|说明
---|---|---
caseId|string|案件id
deviceId|string|设备id
curinfo|string|进度内容

注意：此参数解析会传为数组类型，每一条对应一部当前正在解析的设备，使用deviceId来做区分。举例：

```json
msg: [{
    caseId:'NWca882kj59ck',
    deviceId:'Tq39s9lkjl2cj',
    curinfo:'正在解析微信分身数据'
},{
    caseId:'NWca882kj59ck',
    deviceId:'Ka30lj7Qcb5b',
    curinfo:'正在解析浏览器'
}]
```


#### 解析结束

Parse命令：`parse_end`，参数：

参数名|类型|说明
---|---|---
caseId|string|案件id
deviceId|string|设备id
u64parsestarttime|number|解析开始时间（Unix时间戳）
u64parseendtime|number|解析结束时间（Unix时间戳）
parseapps|any[]|应用数据
isparseok|boolean|是否解析成功

parseapps：

参数名|类型|说明
---|---|---
appname|string|应用名
u64count|number|解析数量