## Socket 通信文档

目前前后台通讯通过 Socket 来完成，参数使用 JSON 格式。

### Socket 分类

Socket 分类使用枚举区分：

| 类别 | 名称  | 说明                   |
| ---- | ----- | ---------------------- |
| 采集 | Fetch | 采集程序的 Socket 名称 |
| 解析 | Parse | 解析程序的 Socket 名称 |

所有 Socket 通讯均有 3 个固定参数不可缺少，举例：

```json
{
	"type": "Fetch",
	"cmd": "connect",
	"msg": "success"
}
```

> 其中`type`表示 Socket 分类，`cmd`表示当前命令，`msg`为命令参数。
> 如果参数为空，使用空字符串代替 null 或 undefined

### 通信命令说明

#### 采集程序连入

Fetch 命令：`connect`，无参数。

UI 反馈命令`connect_ok`，参数：

| 参数名 | 类型   | 说明         |
| ------ | ------ | ------------ |
| count  | number | 当前采集路数 |

举例：

```json
{
	"type": "Fetch",
	"cmd": "connect_ok",
	"msg": { "count": 8 }
}
```

#### 用户警告

Fetch 命令: `user_alert`

#### 设备连入

Fetch 命令: `device_in`

Fetch 参数：

| 参数名       | 类型   | 说明                                   |
| ------------ | ------ | -------------------------------------- |
| manufacturer | string | 手机制造商                             |
| model        | string | 型号                                   |
| usb          | number | USB 序号                               |
| system       | string | 系统                                   |
| fetchState   | enum   | 采集状态枚举                           |
| serial       | string | 设备序列号(点验模式用此字段做唯一区分) |
| phoneInfo    | any[]  | 手机相关信息                           |

phoneInfo 参数：

| 参数名 | 类型   | 说明 |
| ------ | ------ | ---- |
| name   | string | 名称 |
| value  | string | 值   |

举例：

```json
{
	"type": "Fetch",
	"cmd": "device_in",
	"msg": {
		"manufacturer": "oneplus",
		"model": "T7",
		"usb": 5,
		"system": "android",
		"serial": "99001212143552",
		"phoneInfo": [
			{ "name": "系统版本", "value": "h2os_4" },
			{ "name": "IMEI", "value": "869807032871053" }
		]
	}
}
```

#### 设备断开

Fetch 命令: `device_out`

Fetch 参数：

| 参数名 | 类型   | 说明 |
| ------ | ------ | ---- |
| usb    | number | 序号 |

#### 设备状态更新

Fetch 命令: `device_change`

Fetch 参数：

| 参数名     | 类型   | 说明     |
| ---------- | ------ | -------- |
| usb        | number | 序号     |
| fetchState | enum   | 状态枚举 |

#### 接收采集消息

Fetch 命令: `tip_msg`

Fetch 参数：

| 参数名    | 类型   | 说明                                          |
| --------- | ------ | --------------------------------------------- |
| usb       | number | 序号                                          |
| type      | enum   | 消息枚举（闪烁消息,一般消息,iTunes 密码提示） |
| title     | string | 标题                                          |
| content   | string | 内容（与 images 二选一传递）                  |
| images    | enum   | 图示枚举（与 content 二选一传递）             |
| yesButton | object | 是按钮                                        |
| noButton  | object | 否按钮                                        |

当 type 为**iTunes 密码提示**时 UI 需反馈命令`tip_reply`，参数：

| 参数名   | 类型   | 说明                                                     |
| -------- | ------ | -------------------------------------------------------- |
| usb      | number | 序号                                                     |
| password | string | 密码                                                     |
| type     | number | 用户按钮分类(1:密码确认，2:未知密码放弃，3:未知密码继续) |

#### 清空采集消息

Fetch 命令: `tip_clear`

Fetch 参数：

| 参数名 | 类型   | 说明 |
| ------ | ------ | ---- |
| usb    | number | 序号 |

#### 开始采集（取证）

UI 命令：`start_fetch`，参数：

| 参数名       | 类型     | 说明                                                |
| ------------ | -------- | --------------------------------------------------- |
| usb          | number   | USB 序号                                            |
| caseName     | string   | 案件名称                                            |
| casePath     | string   | 案件绝对路径                                        |
| appList      | string[] | App 包名                                            |
| mobileName   | string   | 手机名称                                            |
| mobileHolder | string   | 手机持有人                                          |
| mobileNo     | string   | 手机编号                                            |
| note         | string   | 备注                                                |
| credential   | string   | 证件号码（手机号/军官证号）                         |
| unitName     | string   | 检验单位                                            |
| isAuto       | boolean  | 是否自动解析                                        |
| sdCard       | boolean  | 是否拉取 SD 卡数据                                  |
| mode         | enum     | 0:标准模式,1:点验模式                               |
| platform     | enum     | 0:标准（用户手输入取证数据）,1:广州警综平台推送数据 |

说明：点验模式(mode==1)下会从 NeDB 数据库中读取记录，若已存在某条设备的记录（用设备序列号来做唯一），则读取数据自动进行采集，免去用户再次手动输入采集信息；
警综平台(platform==2)与点验模式是互斥的，开启平台必须关闭点验模式，反之亦是。

#### 停止采集（取证）

UI 命令：`stop_fetch`，参数：

| 参数名 | 类型   | 说明 |
| ------ | ------ | ---- |
| usb    | number | 序号 |

#### 采集进度

Fetch 命令：`fetch_progress`，参数：

| 参数名 | 类型   | 说明     |
| ------ | ------ | -------- |
| usb    | number | 序号     |
| type   | enum   | 进度分类 |
| info   | string | 进度内容 |

> 进度分类枚举 0:一般消息（黑色标识）1:警告消息（红色标识）2：特殊消息（蓝色标识）

#### 解析程序连入

Parse 命令：`connect`，无参数。

#### 开始解析

UI 命令：`start_parse`，参数：

| 参数名    | 类型   | 说明         |
| --------- | ------ | ------------ |
| caseId    | string | 案件 id      |
| deviceId  | string | 设备 id      |
| phonePath | string | 手机绝对路径 |

#### 解析进度

Parse 命令：`parse_curinfo`，参数：

| 参数名   | 类型   | 说明     |
| -------- | ------ | -------- |
| caseId   | string | 案件 id  |
| deviceId | string | 设备 id  |
| curinfo  | string | 进度内容 |

注意：此参数解析会传为数组类型，每一条对应一部当前正在解析的设备，使用 deviceId 来做区分。举例：

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

Parse 命令：`parse_end`，参数：

| 参数名            | 类型    | 说明                                      |
| ----------------- | ------- | ----------------------------------------- |
| caseId            | string  | 案件 id                                   |
| deviceId          | string  | 设备 id                                   |
| u64parsestarttime | number  | 解析开始时间（Unix 时间戳），解析失败为-1 |
| u64parseendtime   | number  | 解析结束时间（Unix 时间戳），解析失败为-1 |
| parseapps         | any[]   | 应用数据                                  |
| isparseok         | boolean | 是否解析成功                              |

parseapps：

| 参数名   | 类型   | 说明     |
| -------- | ------ | -------- |
| appname  | string | 应用名   |
| u64count | number | 解析数量 |

#### 导入第三方数据

Parse 命令：`import_device`，参数：
| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| caseId | string | 案件 id |
| deviceId | string | 设备 id |
| dataType | string | 导入数据类型 |
| mobileHolder | string | 持有人 |
| mobileNo | string | 手机编号 |
| mobileName | string | 手机名称 |
| packagePath | string | 第三方数据位置 |
| phonePath | string | 手机路径 |

> `dataType`数据在`importTypes.ts`中维护，以后会根据不同手机类型扩展

#### 提示用户输入备份密码

Parse 命令：`back_datapass`，参数：
| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| caseId | string | 案件 id |
| deviceId | string | 设备 id |
| mobileName | string | 手机名称 |

#### 用户输入备份密码提交

Parse 命令：`confirm_datapass`，参数：
| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| caseId | string | 案件 id |
| deviceId | string | 设备 id |
| mobileName | string | 手机名称 |
| forget | boolean | 是否忘记密码 |
| password | string | 密码 |
