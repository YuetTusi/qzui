## 配置文件说明

| 配置项         |  类型   | 说明                                        |
| :------------- | :-----: | :------------------------------------------ |
| max            | number  | 最大采集路数（1<=n<=20）                    |
| useServerCloud | boolean | 是否使用短信云取证功能                      |
| useBcp         | boolean | 是否启用BCP                                 |
| useToolBox     | boolean | 是否启用工具箱                              |
| useFakeButton  | boolean | 是否显示工具箱假按钮                        |
| useAi          | boolean | 是否启用AI分析                              |
| cloudAppUrl    | string  | 云取应用HTTP数据接口                        |
| cloudAppMd5    | string  | 云取应用MD5码HTTP数据接口                   |
| logo           | string  | 软件 LOGO 文件名（resources\config 目录下） |
| windowHeight   | number  | 窗口默认高度                                |
| windowWidth    | number  | 窗口默认宽度                                |
| minHeight      | number  | 最小高度                                    |
| minWidth       | number  | 最小宽度                                    |
| center         | boolean | 是否居中显示                                |
| tcpPort        | number  | TCP 通讯端口号                              |
| httpPort       | number  | HTTP 服务端口号                             |
| fetchPath      | string  | 采集程序路径(相对于 UI 发布目录)            |
| fetchExe       | string  | 采集程序名(为空默认为 n_fetch.exe)          |
| parsePath      | string  | 解析程序路径(相对于 UI 发布目录)            |
| parseExe       | string  | 解析程序名                                  |
| publishPage    | string  | 发布页面，打包发布时会引用此页面            |
| logFile        | string  | 日志文件路径                                |
| devPageUrl     | string  | 本地开发页面                                |