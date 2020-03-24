# RPC接口文档


### GetDevlist

说明：连接设备获取手机型号、品牌、deviceID等数据

参数：无

返回：已连接的手机列表 （stPhoneInfoPara数组）

调用示例：
```js
let phoneData: stPhoneInfoPara[] = PhoneInfolist();
```

### Start

说明：采集手机数据（支持多部）

参数：
    1.数组，由后端返回的结构体数据。多部手机在数组中追加即可。

调用示例：

```js
Start([
    //一部手机的结构体数据
    {
        piSerialNumber: "49d897fa810277dd0bc34d3db49e51975c75acbd",
        piLocationID: "Port_#0003.Hub_#0004",
        //.......
    }
]);
```

### CancelFetch

说明：终止手机采集

参数：手机序列号+物理USB端口号（拼接到一起）

返回：无

调用示例：

```js
CancelFetch('dd2d510cec5c11fe10131f9a410d96116eb8337cPort_#0003.Hub_#0004');
```

### OperateFinished

说明： 引导用户操作完成

参数：手机序列号+物理USB端口号（拼接到一起）

返回：无

调用示例：

```js
OperateFinished('dd2d510cec5c11fe10131f9a410d96116eb8337cPort_#0003.Hub_#0004');
```


### GetCheckOrganizationList

说明：查询检验单位表格数据

参数：关键字，从第几条开始

返回：CCheckOrganization类型数组

调用示例：

```js
GetCheckOrganizationList('右安门派出所', 9);
GetCheckOrganizationList('', 0); //当关键字传空为查询全部记录
```

### SaveCheckOrganizationInfo

说明：保存检验单位

参数：CCheckOrganization对象

返回：无

调用示例：
```js
SaveCheckOrganizationInfo({
    m_strCheckOrganizationID: '25070084',
    m_strCheckOrganizationName: '北京大红门交通执法中心',
    m_nCnt: 0
});
```

### GetCurCheckOrganizationInfo

说明：获取当前检验单位

参数：无

返回：CCheckOrganization对象

调用示例：
```js
GetCurCheckOrganizationInfo();
```

###  GetCheckerInfo

说明：查询全部检验员

参数：无

返回：CCheckerInfo类型列表

调用示例：
```js
let list:CCheckerInfo[] = GetCheckerInfo();
```

### SaveCheckerInfo

说明：新增、编辑、删除检验员。当m_strUUID为一个新id时为新增操作，当m_strUUID已存在时为编辑操作，当m_strUUID已存在其它属性传空时为删除。

参数：CCheckerInfo对象

返回：无

调用示例：

```js
//新增：
let entity = new CCheckerInfo();
entity.m_strUUID = uuid(); //新id
entity.m_strCheckerName = '张警官';
entity.m_strCheckerID = '10010';
SaveCheckerInfo(entity);
```
```js
//删除：
let entity = new CCheckerInfo();
entity.m_strUUID = 'e4ce764a-5fb3-4c7b-8fb5-4ddcbc591926'; //待删除对象的id
entity.m_strCheckerName = ''; //置空
entity.m_strCheckerID = '';//置空
SaveCoronerInfo(entity);
```
### GetDataSavePath

说明：查询案件列表

参数：案件存储路径

返回：CCaseInfo列表

调用示例：

```js
let list:CCaseInfo[] = GetDataSavePath('C:\\TZSafe\\phone');
```

### GetPhoneList

说明：查询案件下手机列表（子表数据）

参数：案件绝对路径

返回：字符串数组string[]

调用示例：
```js
let list:string[] = GetPhoneList('E:\\TZTest\\北京216P2P案_2020011915225560');
```

### DeletePhoneInfo

说明：删除采集手机数据

参数：手机数据绝对路径

返回：无

调用示例：
```js
DeletePhoneInfo('E:\\TZTest\\北京216P2P案_2020011915225560\\Samsung-A90_2020012011068780');
```

### SaveCaseInfo

说明：保存案件数据

参数：CCaseInfo实例

返回：无

调用示例：

```js
SaveCaseInfo(new CCaseInfo({
    m_strCaseName:'诈骗案_201910114925160',
    m_bIsAutoParse:false,
    m_bIsBCP:false,
    m_Applist:[]
}));
```

### DeleteCaseInfo


说明：删除案件数据

参数：案件完整路径

返回：无

调用示例：

```js
DeleteCaseInfo('C:\\TZSafe\\phone\\诈骗案_201910114925160');
```

### GetFetchTypeList


说明：查询采信方式下拉数据

参数：手机序列号+物理USB端口号（拼接到一起），如果是第三方数据，传固定字串：`ThirdData`

返回：采集方式数据

调用示例：

```js
GetFetchTypeList('dd2d510cec5c11fe10131f9a410d96116eb8337cPort_#0003.Hub_#0004');
GetFetchTypeList('ThirdData'); //获取第三方数据的采集方式
```

### SubscribePhone

说明：订阅采集状态详情，当调用此接口后，后台会向UI推送当前手机的采集详情，推送的方法由UI方使用反向调用提供

参数：手机序列号+物理USB端口号（拼接到一起）

返回：boolean，订阅成功后返回true

调用示例：

```js
SubscribePhone('dd2d510cec5c11fe10131f9a410d96116eb8337cPort_#0003.Hub_#0004');
```

### UnsubscribePhone

说明：退订采集状态详情，调用此接口后，后台停止向UI推送详情数据

参数：手机序列号+物理USB端口号（拼接到一起）

返回：boolean，退订成功后返回true

调用示例：

```js
UnsubscribePhone('dd2d510cec5c11fe10131f9a410d96116eb8337cPort_#0003.Hub_#0004');
```

### SaveDataSavePath

说明：保存案件存储路径

参数：路径

返回：无

调用示例：

```js
SaveDataSavePath('E:\\TZTest');
```

### GetAllInfo

说明：查询解析列表数据

参数：无

返回：UIRetOneInfo[]

调用示例：

```js
GetAllInfo();
```

### StartManualTask

说明：手动解析一部手机数据（当案件是“非自动解析”类型时可以让用户手动去解析，自动解析的案件不使用此方法）

参数：案件名，手机名

返回：boolean

调用示例：

```js
StartManualTask('诈骗案_201912013032', '13802271435');
```


### GetOneInfo

说明：取当前时刻的解析详情信息

参数：案件名，手机名

返回：string（当前解析的进度消息）

调用示例：

```js
GetOneInfo('诈骗案_201912013032', '13802271435');
```

### hasParsing

说明：当前时刻是否有正在解析的设备

参数：无

返回：boolean（true为有解析的设备）

调用示例：

```js
let parsing:boolean = hasParsing();
```

### IsInFetchingState

说明：当前时刻是否有正在采集的设备

参数：无

返回：boolean（true为有采集的设备）

调用示例：

```js
let fetching:boolean = IsInFetchingState();
```

### SaveBCPInfo

说明：保存BCP数据（解析时让用户补全BCP信息）

参数：手机绝对路径string, BCP对象数据CBCPInfo

返回：无

调用示例：

```js
SaveBCPInfo('D:\\TZSafe\\Phone\\baoding_2020021918061740\\OPPO A59s_20200219190735', new CBCPInfo({
    m_strBCPCheckOrganizationName: "云南省红河哈尼族彝族自治州建水县公安局指挥中心110接处警中队"
    m_strBCPCheckOrganizationID: "532524040300"
    m_strAddress: "2121122112"
    m_strBirthday: "2020-03-18"
    m_strCertificateCode: "221"
    m_strCertificateEffectDate: "2020-03-26"
    m_strCertificateInvalidDate: "2020-03-18"
    m_strCertificateIssueUnit: "121"
    m_strCertificateType: "111"
    m_strNation: "1"
    m_strSexCode: "0"
    m_strUserPhoto: "C:\\Users\\cuiyu\\Pictures\\聊天\\EOdS5L4U8AIY0jf.jpg"
    }));
```

### GetBCPInfo

说明：查询已录入的BCP数据

参数：手机绝对路径string

返回：CBCPInfo

调用示例：

```js
let data:CBCPInfo = GetBCPInfo('D:\\TZSafe\\Phone\\baoding_2020021918061740\\OPPO A59s_20200219190735');
```