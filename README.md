## 说明

### 运行前准备工作

安装node环境版本v10.x以上

运行项目请先在本机全局安装`concurrently`和`electron`包：

```txt
npm install -g concurrently electron
```

安装yarn

然后进入项目所在目录，使用yarn进行安装：

```txt
yarn install
```

保证所有包安装成功即可。

### 运行步骤

<span style="color:red;">**首次运行**</span> 在终端依次执行如下命令：

1. 编译dll： `yarn run build:dll`
2. 编译项目：`yarn run build`
3. 运行：`yarn run app`

之后再次启动项目只需执行`yarn run app`即可。

如果在安装electron时遇到*.zip不能下载问题，请科学上网。

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

