## 说明

### 运行前准备工作

-   安装 node 环境版本 v10.x 以上

-   安装 python

-   安装 yarn

从版本库中拉下源码然后进入项目所在目录，使用 yarn 进行安装：

```bash
cd [你的项目目录]
yarn install
```

### 运行步骤

<strong style="color:red;">首次运行</strong> 在终端依次执行如下命令：

1. 编译 dll： `yarn run build:dll`
2. 编译项目：`yarn run build`
3. 运行：`yarn run app`

之后再次启动项目只需执行`yarn run app`即可。开发进程中有新图片等静态资源引入时，要再次执行`yarn run build`命令。

>  注意：在项目中若需要其它第三方包请使用 yarn 来安装，不要使用 npm！

### 发布

发布前若 ui.yaml 配置文件有变动，则使用命令行进行加密。

使用 npm 安装命令行工具：

```bash
npm install -g azjm
```

然后进入项目的`src/config`目录，使用命令进行加密，加密算法使用默认`rc4`：

```bash
azjm
```

成功后会在`src/config`目录中生成`conf`文件。将新conf文件拷贝到发布应用的`resources\config`下即可。

ui.yaml 无变化不需要上述操作

采集路数在ui.yaml中的`max`属性中设置；采集路数建议配置在`2 ~ 20`路之间

在命令行使用 yarn 命令来发布：

```bash
yarn run dist
```

打包成功后即可在 dist 目录找到 zip 包及 Windows 安装包。

后续升级中，如果只改动了主进程源码main.js以及主窗口的源代码（除`src/renderer`目录），那么打包发布不需要全量更新，只需发布`app.asar.unpacked`下的相关文件即可。

### 运行命令说明

| yarn 命令             | 说明                                 |
| --------------------- | ------------------------------------ |
| `yarn run build:dll`  | 编译公共库 dll                       |
| `yarn run build:prod` | 以生产方式编译                       |
| `yarn run build`      | 编译项目                             |
| `yarn run app`        | 运行项目                             |
| `yarn run pack`       | 打包项目（以目录形式发布，用于测试） |
| `yarn run dist`       | 发布项目（发布最终安装包和 zip 包）  |

### 可能出现的错误

如果在使用 yarn 命令打包中报找不到 electron，是因为在墙国无法下载可翻墙解决，也可使用淘宝镜像，方法如下：

在[淘宝镜像](https://npm.taobao.org/mirrors/electron)页面中找到对应的 electron 版本，下载对应平台的 electron 包，解压到项目`node_modules/electron/dist`目录下。

之后在`node_modules/electron`目录中新建一个文本文件`path.txt`，写入：

```txt
electron.exe
```

之后即可打包运行应用

第一次在使用`yarn run dist`发布时也有可能报找不到 electron.x.x.zip 包，方法也是先手动下载对应的版本，然后拷到：

```txt
C:\Users\[你的用户名]\AppData\Local\electron\Cache
```

再次执行`yarn run dist`命令，即可成功发布应用

如果还有其他问题，Google大法好 ^_^