## 配置文件说明

| 配置项          | 类型    | 说明                                              |
| :-------------- | :------ | :------------------------------------------------ |
| devPageUrl      | string  | 本地开发页面                                      |
| title           | string  | UI 左上角标题                                     |
| author          | string  | 开发者                                            |
| windowHeight    | number  | 窗口默认高度                                      |
| windowWidth     | number  | 窗口默认宽度                                      |
| minHeight       | number  | 最小高度                                          |
| minWidth        | number  | 最小宽度                                          |
| center          | boolean | 是否居中显示                                      |
| max             | number  | 采集数量（数字>=2,若为 2 路则要改 less 相关配置） |
| tcpPort         | number  | TCP 通讯端口号                                    |
| httpPort        | number  | HTTP 服务端口号                                   |
| fetchPath       | string  | 采集程序路径(相对于 UI 发布目录)                  |
| fetchExe        | string  | 采集程序名(为空默认为 n_fetch.exe)                |
| parsePath       | string  | 解析程序路径(相对于 UI 发布目录)                  |
| parseExe        | string  | 解析程序名                                        |
| publishPage     | string  | 发布页面，打包发布时会引用此页面                  |
| logFile         | string  | 日志文件路径                                      |
| usePlatformData | boolean | 是否使用第三方平台数据(false 为正常采集流程)      |
| platformMethod  | string  | 第三方平台接口数据转换方法                        |
