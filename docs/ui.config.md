## 配置文件说明

| 配置项                  |  类型   | 说明                                                 |
| :---------------------- | :-----: | :--------------------------------------------------- |
| max                     | number  | 建议采集路数（1<=n<=20）                             |
| useFetch                | boolean | 是否开启标准取证                                     |
| useServerCloud          | boolean | 是否开启短信云取证                                   |
| useBcp                  | boolean | 是否启用 BCP                                         |
| useToolBox              | boolean | 是否启用工具箱                                       |
| useFakeButton           | boolean | 是否显示工具箱假按钮                                 |
| useAi                   | boolean | 是否启用 AI 分析                                     |
| useTraceLogin           | boolean | 是否启用查询登录                                     |
| cloudAppUrl             | string  | 云取应用 HTTP 数据接口                               |
| cloudAppMd5             | string  | 云取应用 MD5 码 HTTP 数据接口                        |
| useHardwareAcceleration | boolean | 是否开启硬件加速(若无此配置项默认 Win7 系统禁用加速) |
| logo                    | string  | 软件 LOGO 文件名（resources\config 目录下）          |
| windowHeight            | number  | 窗口默认高度                                         |
| windowWidth             | number  | 窗口默认宽度                                         |
| minHeight               | number  | 最小高度                                             |
| minWidth                | number  | 最小宽度                                             |
| center                  | boolean | 是否居中显示                                         |
| tcpPort                 | number  | TCP 通讯端口号                                       |
| httpPort                | number  | HTTP 服务端口号                                      |
| fetchPath               | string  | 采集程序路径(相对于 UI 发布目录)                     |
| fetchExe                | string  | 采集程序名(为空默认为 n_fetch.exe)                   |
| parsePath               | string  | 解析程序路径(相对于 UI 发布目录)                     |
| parseExe                | string  | 解析程序名                                           |
| logFile                 | string  | 日志文件路径                                         |
| devPageUrl              | string  | 本地开发页面                                         |
