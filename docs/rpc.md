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

参数：数组，由后端返回的结构体数据。多部手机在数组中追加即可。

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
]);
```