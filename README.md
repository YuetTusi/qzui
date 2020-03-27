## 说明

### 运行前准备工作

- 安装node环境版本v10.x以上

- 安装python

- 安装yarn

然后进入项目所在目录，使用yarn进行安装：

```txt
yarn install
```

### 运行步骤

<span style="color:red;">**首次运行**</span> 在终端依次执行如下命令：

1. 编译dll： `yarn run build:dll`
2. 编译项目：`yarn run build`
3. 运行：`yarn run app`

之后再次启动项目只需执行`yarn run app`即可。开发进程中有新图片等静态资源引入时，要再次执行`yarn run build`命令。

### 运行命令说明

yarn命令|说明
---|---
`yarn run build:dll`|编译公共库dll
`yarn run build:prod`|以生产方式编译
`yarn run build`|编译项目
`yarn run app`|运行项目
`yarn run pack`|打包项目（以目录形式发布，用于测试）
`yarn run dist`|发布项目（发布最终安装包和zip包）

### 注意

**在项目中若需要其它第三方包请使用yarn来安装，不要使用npm！切记。**

有时在墙国无法下载electron.x.x.zip的问题，可翻墙解决，也可使用淘宝镜像，方法如下：

在[淘宝镜像](https://npm.taobao.org/mirrors/electron)页面中找到对应的electron版本，下载对应平台的electron包，解压到项目`node_modules/electron/dist`目录下。

之后在`node_modules/electron`目录中新建一个文本文件`path.txt`，写入：

```txt
electron.exe
```
之后即可打包运行应用