# RPC接口文档


### PhonInfolist
说明：连接设备获取手机型号、品牌、deviceID等数据

参数：无

调用示例：
```js
PhoneInfolist();
```

### Start

说明：采集手机数据（支持多部）

参数：
    1.数组，由后端返回的结构体数据。多部手机在数组中追加即可。
    2.案件CFetchDataInfo对象实例

调用示例：

```js
Start([
    //一部手机的结构体数据
    {
        dtSupportedOpt: 0,
        m_bIsConnect: true,
        m_nDevID: 1,
        piAndroidVersion: "12.3",
        piCOSName: "",
        piCOSVersion: "",
        piDeviceName: "",
        piMakerName: "Apple",
        piPhoneType: "iPhone 6s Plus",
        piSerialNumber: "49d897fa810277dd0bc34d3db49e51975c75acbd",
        piSystemType: 2,
        piSystemVersion: "",
        status: 2
    }
], new CFetchDataInfo({...}));
```

### GetFetchCorporation

说明：查询检验单位表格数据

参数：关键字，从第几条开始

返回：CFetchCorporation类型数组

调用示例：

```js
GetFetchCorporation('右安门派出所', 9);
GetFetchCorporation('', 0); //当关键字传空为查询全部记录
```

### SaveFetchCorpInfo

说明：保存检验单位

参数：CFetchCorporation对象

返回：无

调用示例：
```js
SaveFetchCorpInfo({
    m_strID: '25070084',
    m_strName: '北京大红门交通执法中心',
    m_nCnt: 0
});
```

### GetFetchCorpInfo

说明：获取当前检验单位

参数：无

返回：CFetchCorporation对象

调用示例：
```js
GetFetchCorpInfo();
```

###  GetCoronerInfo

说明：查询全部检验员

参数：无

返回：CCoronerInfo类型列表

调用示例：
```js
let list:GetCoronerInfo[] = GetCoronerInfo();
```

### SaveCoronerInfo

说明：新增、编辑、删除检验员。当m_strUUID为一个新id时为新增操作，当m_strUUID已存在时为编辑操作，当m_strUUID已存在其它属性传空时为删除。

参数：CCoronerInfo对象

返回：无

调用示例：

```js
//新增：
let entity = new CCoronerInfo();
entity.m_strUUID = uuid(); //新id
entity.m_strCoronerName = '张警官';
entity.m_strCoronerID = '10010';
SaveCoronerInfo(entity);
```
```js
//删除：
let entity = new CCoronerInfo();
entity.m_strUUID = 'e4ce764a-5fb3-4c7b-8fb5-4ddcbc591926'; //待删除对象的id
entity.m_strCoronerName = ''; //置空
entity.m_strCoronerID = '';//置空
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

参数：手机序列号+物理USB端口号（拼接到一起）

返回：采集方式数据

调用示例：

```js
GetFetchTypeList('dd2d510cec5c11fe10131f9a410d96116eb8337cPort_#0003.Hub_#0004');
```