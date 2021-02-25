## Socket 通信文档

目前前后台通讯通过 Socket 来完成，参数使用 JSON 格式。

### Socket 分类

Socket 分类使用枚举区分：

| 类别     | 名称  | 说明                   |
| -------- | ----- | ---------------------- |
| 采集     | Fetch | 采集程序的 Socket 名称 |
| 解析     | Parse | 解析程序的 Socket 名称 |
| 警综平台 | Bho   | 警综平台 Socket 名称   |

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

### 采集通信命令说明

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

| 参数名       | 类型          | 说明         |
| ------------ | ------------- | ------------ |
| usb          | number        | 序号         |
| fetchState   | enum          | 状态枚举     |
| manufacturer | string        | 设备厂商     |
| mode         | enum          | 模式         |
| cloudAppList | OneCloudApp[] | 云取应用列表 |

> 当mode===3云取证，由Fetch推送应用列表，根据应用结果状态来以颜色区分取证成功与失败

#### 接收采集消息

Fetch 命令: `tip_msg`

Fetch 参数：

| 参数名    | 类型   | 说明                              |
| --------- | ------ | --------------------------------- |
| usb       | number | 序号                              |
| type      | enum   | 消息枚举（TipType）               |
| title     | string | 标题                              |
| content   | string | 内容（与 images 二选一传递）      |
| images    | enum   | 图示枚举（与 content 二选一传递） |
| yesButton | object | 是按钮                            |
| noButton  | object | 否按钮                            |

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

#### 接收云取证验证码详情

Fetch 命令: `sms_msg`

参数：

| 参数名  | 类型   | 说明         |
| ------- | ------ | ------------ |
| usb     | number | 序号         |
| appId   | string | 云取证应用id |
| message | object | 详情消息     |

message:
| 参数名     | 类型   | 说明     |
| ---------- | ------ | -------- |
| content    | string | 消息内容 |
| type       | enum   | 分类     |
| actionTime | Date   | 消息时间 |

> 消息分类 - 0：黑色 1：红色 2：蓝色
> 说明：fetch推送来的消息根据appId来做区分，显示到对应的应用组件上

#### 发送验证码

Fetch 命令: `sms_send`

参数：

| 参数名   | 类型     | 说明       |
| -------- | -------- | ---------- |
| usb      | number   | 序号       |
| code     | string   | 短信验证码 |
| appId    | string   | 应用id     |
| packages | string[] | 应用包名   |
| type     | enum     | 类型枚举   |

> 枚举说明： 4-发送； 5-取消；6-重新发送验证码

#### 开始采集（取证）

UI 命令：`start_fetch`，参数：

| 参数名       | 类型        | 说明                                      |
| ------------ | ----------- | ----------------------------------------- |
| usb          | number      | USB 序号                                  |
| caseName     | string      | 案件名称                                  |
| casePath     | string      | 案件绝对路径                              |
| appList      | CParseApp[] | App 包名                                  |
| mobileName   | string      | 手机名称                                  |
| mobileHolder | string      | 手机持有人                                |
| mobileNo     | string      | 手机编号                                  |
| mobileNumber | string      | 手机号（短信云取需传手机号）              |
| note         | string      | 备注                                      |
| credential   | string      | 证件号码（手机号/军官证号）               |
| unitName     | string      | 检验单位                                  |
| hasReport    | boolean     | 是否生成报告                              |
| isAuto       | boolean     | 是否自动解析                              |
| sdCard       | boolean     | 是否拉取 SD 卡数据                        |
| mode         | enum        | 0:标准采集,1:点验,2:广州警综平台,3:云取证 |

> 说明：点验模式(mode==1)下会从 NeDB 数据库中读取记录，若已存在某条设备的记录（用设备序列号来做唯一），则读取数据自动进行采集，免去用户再次手动输入采集信息；警综平台(mode==2)与点验模式是互斥的，开启平台必须关闭点验模式，反之亦是。

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

#### 发送多用户/隐私空间消息

Fetch 命令：`extra_msg`，参数：

| 参数名  | 类型   | 说明     |
| ------- | ------ | -------- |
| usb     | number | 序号     |
| content | string | 消息内容 |

#### 查询破解设备列表：

Fetch 命令：`crack_query`，无参数

#### 向 UI 发送破解设备列表

Fetch 命令：`crack_list`，参数：

| 参数名 | 类型   | 说明     |
| ------ | ------ | -------- |
| name   | string | 手机名称 |
| value  | string | 值       |

#### 向 UI 发送破解进度

Fetch 命令：`crack_msg`，参数：

| 参数名 | 类型   | 说明     |
| ------ | ------ | -------- |
| msg    | string | 进度消息 |

#### 开始破解

Fetch 命令：`start_crack`，参数：

| 参数名 | 类型   | 说明       |
| ------ | ------ | ---------- |
| msg    | string | 所选设备值 |

#### 开始恢复

Fetch 命令：`start_recover`，参数：

| 参数名 | 类型   | 说明       |
| ------ | ------ | ---------- |
| msg    | string | 所选设备值 |

#### 关闭破解弹框：

Fetch 命令：`close_crack`，无参数

#### 解析程序连入

Parse 命令：`connect`，无参数。

### 解析通信命令说明

#### 开始解析

UI 命令：`start_parse`，参数：

| 参数名       | 类型     | 说明                                                  |
| ------------ | -------- | ----------------------------------------------------- |
| caseId       | string   | 案件 id                                               |
| deviceId     | string   | 设备 id                                               |
| phonePath    | string   | 手机绝对路径                                          |
| hasReport    | boolean  | 是否生成报告                                          |
| useKeyword   | boolean  | 是否开启过滤敏感词                                    |
| isDel        | boolean  | 解析后是否删除原数据                                  |
| cloudAppList | string[] | Token云取证应用包名                                   |
| dataMode     | enum     | 模式（0：标准,1：点验,2：广州警综平台,3：短信云取证） |

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
| 参数名       | 类型     | 说明           |
| ------------ | -------- | -------------- |
| caseId       | string   | 案件 id        |
| deviceId     | string   | 设备 id        |
| dataType     | string   | 导入数据类型   |
| mobileHolder | string   | 持有人         |
| mobileNo     | string[] | 代替传IMEI     |
| mobileName   | string   | 手机名称       |
| model        | string   | 手机名称       |
| packagePath  | string   | 第三方数据位置 |
| phonePath    | string   | 手机路径       |
| hasReport    | boolean  | 是否生成报告   |
| useKeyword   | boolean  | 是否过滤敏感词 |
| note         | string   | 备注           |

> `dataType`数据在`importTypes.ts`中维护，以后会根据不同手机类型扩展

#### 导入第三方数据失败

Parse 命令：`import_err`, 参数：
| 参数名     | 类型   | 说明     |
| ---------- | ------ | -------- |
| caseId     | string | 案件 id  |
| deviceId   | string | 设备 id  |
| mobileName | string | 手机名称 |
| msg        | string | 错误消息 |

#### 提示用户输入备份密码

Parse 命令：`back_datapass`，参数：
| 参数名     | 类型   | 说明     |
| ---------- | ------ | -------- |
| caseId     | string | 案件 id  |
| deviceId   | string | 设备 id  |
| mobileName | string | 手机名称 |

#### 用户输入备份密码提交

Parse 命令：`confirm_datapass`，参数：
| 参数名     | 类型    | 说明         |
| ---------- | ------- | ------------ |
| caseId     | string  | 案件 id      |
| deviceId   | string  | 设备 id      |
| mobileName | string  | 手机名称     |
| forget     | boolean | 是否忘记密码 |
| password   | string  | 密码         |

#### 更新平台设置

Parse 命令：`plat_change`，参数：
| 参数名      | 类型    | 说明       |
| ----------- | ------- | ---------- |
| ip          | string  | 平台IP地址 |
| port        | string  | 平台端口号 |
| usePlatform | boolean | 是否开启   |

### 警综平台通信命令说明

#### 向 UI 发送警综平台数据

Bho 命令：`platform`, 参数：

| 参数名             | 类型   | 说明                                              |
| ------------------ | ------ | ------------------------------------------------- |
| CaseID             | string | 案件编号                                          |
| CaseName           | string | 案件名称                                          |
| CaseTypeCode       | string | 案件类型代码                                      |
| CaseType           | string | 案件类型                                          |
| ab                 | string | 案别代码                                          |
| abName             | string | 案别名称                                          |
| ObjectID           | string | 人员编号                                          |
| OwnerName          | string | 姓名（持有人）                                    |
| Bm                 | string | 曾用名（别名）                                    |
| IdentityIDTypeCode | string | 证件类型 Code                                     |
| IdentityIDType     | string | 证件类型名称                                      |
| IdentityID         | string | 证件号码                                          |
| Hjdz               | string | 户籍地址                                          |
| Dz                 | string | 现地址                                            |
| Gzdw               | string | 工作单位                                          |
| GuojiaCode         | string | 国家编码                                          |
| Guojia             | string | 国家                                              |
| MinzuCode          | string | 民族编码                                          |
| Minzu              | string | 民族名称                                          |
| Phone              | string | 手机号码                                          |
| Desc               | string | 描述                                              |
| Date               | string | 采集日期                                          |
| flag               | string | 采集类型 01 嫌疑人,02 社会人员                    |
| OfficerID          | string | 采集民警警号                                      |
| OfficerName        | string | 采集民警姓名                                      |
| dept               | string | 采集民警单位代码                                  |
| deptName           | string | 采集民警单位名称                                  |
| strflg             | string | 请求唯一 ID 由 CaseID,CaseName,Phone 综合计算得出 |
| strPhonePath       | string | 手机绝对路径                                      |
| strreserved1       | string | 保留字段                                          |
| strreserved2       | string | 保留字段                                          |
| errcode            | number | 错误码                                            |
| errmsg             | string | 错误消息                                          |

> 如果接收警综数据的错误码不存在(errcode===undefined)，说明接口访问成功
