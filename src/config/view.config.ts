
interface IConfig {
    [prop: string]: any;
}
interface IApps {
    [prop: string]: any;
}

let config: IConfig = {
    //远程PRC地址
    // rpcUri: "tcp4://192.168.1.254:41622/",
    rpcUri: "tcp4://127.0.0.1:41622/",
    //本地反馈服务端口
    replyPort: '8088',
    //WebApi(本地测试)
    devApi: "http://127.0.0.1:3000/",
    //WebApi(上线)
    prodApi: "/",
    //案件默认存储路径
    casePath: 'C:\\TZSafe'
}

let apps: IApps = {
    "fetch": [
        {
            "class": "Phone",
            "name": "BaseInfo",
            "desc": "基本信息",
            "select": -1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": true,
            "app_list": [
                {
                    "name": "base",
                    "app_type": "phone_base",
                    "route_app_type": "base_0",
                    "desc": "手机基本信息",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "sms",
                    "app_type": "9980002",
                    "route_app_type": "base_1",
                    "desc": "短信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "contact",
                    "app_type": "9980001",
                    "route_app_type": "base_2",
                    "desc": "通讯录",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "calllog",
                    "app_type": "9980007",
                    "route_app_type": "base_3",
                    "desc": "通话记录",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "calendar",
                    "app_type": "9980006",
                    "route_app_type": "base_4",
                    "desc": "日历",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "System",
            "desc": "系统信息",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "sim",
                    "app_type": "sim",
                    "route_app_type": "system_0",
                    "desc": "SIM卡",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "wifi",
                    "app_type": "9980005",
                    "desc": "Wifi",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "bluetooth",
                    "app_type": "9980004",
                    "desc": "蓝牙",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "appins",
                    "app_type": "installed_app",
                    "route_app_type": "system_1",
                    "desc": "安装应用",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "appaccount",
                    "app_type": "virtual",
                    "route_app_type": "system_2",
                    "desc": "虚拟身份",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "File",
            "name": "File",
            "desc": "文件提取",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "picture",
                    "desc": "图片",
                    "app_type": "media-image",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "video",
                    "desc": "视频",
                    "app_type": "media-video",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "audio",
                    "desc": "音频",
                    "app_type": "media-audio",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "IM",
            "desc": "即时通讯",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "qq",
                    "app_type": "1030001",
                    "desc": "QQ",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "wechat",
                    "app_type": "1030036",
                    "desc": "微信",
                    "select": 1,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "alipay",
                    "app_type": "1290007",
                    "desc": "支付宝",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "whatsapp",
                    "app_type": "1030038",
                    "desc": "Whatsapp",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "momo",
                    "app_type": "1030044",
                    "desc": "陌陌",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "blued",
                    "app_type": "1030146",
                    "desc": "Blued",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "putong",
                    "app_type": "1030206",
                    "desc": "探探",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "douyin",
                    "app_type": "1400036",
                    "desc": "抖音短视频",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kuaishou",
                    "app_type": "1400026",
                    "desc": "快手",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "keige",
                    "app_type": "1390006",
                    "desc": "全民K歌",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "yy",
                    "app_type": "1030050",
                    "desc": "YY语音",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "yujian",
                    "app_type": "1030056",
                    "desc": "遇见",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "feixin",
                    "app_type": "1030028",
                    "desc": "飞信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "skype",
                    "app_type": "1030027",
                    "desc": "Skype",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "miliao",
                    "app_type": "1030035",
                    "desc": "米聊",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "line",
                    "app_type": "1030043",
                    "desc": "Line",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "facebook",
                    "app_type": "1030045",
                    "desc": "Facebook",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "renren",
                    "app_type": "1030046",
                    "desc": "人人",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "yixin",
                    "app_type": "1030047",
                    "desc": "易信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "laiwang",
                    "app_type": "1030048",
                    "desc": "来往",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "wangxin",
                    "app_type": "1030049",
                    "desc": "旺信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "talkbox",
                    "app_type": "1030051",
                    "desc": "Talkbox",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "voxer",
                    "app_type": "1030052",
                    "desc": "Voxer",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "viber",
                    "app_type": "1030053",
                    "desc": "Viber",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "coco",
                    "app_type": "1030057",
                    "desc": "Coco",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kakao-talk",
                    "app_type": "1030058",
                    "desc": "KakaoTalk",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "raid-call",
                    "app_type": "1030059",
                    "desc": "RaidCall",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "youxin",
                    "app_type": "1030060",
                    "desc": "有信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "zello",
                    "app_type": "1030080",
                    "desc": "Zello",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "hello-talk",
                    "app_type": "1030083",
                    "desc": "HelloTalk",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kee-chat",
                    "app_type": "1039982",
                    "desc": "KeeChat",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "oovoo",
                    "app_type": "1039981",
                    "desc": "Oovoo",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "didi",
                    "app_type": "1039966",
                    "desc": "DiDi",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "nimbuzz",
                    "app_type": "1039953",
                    "desc": "Nimbuzz",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "imo",
                    "app_type": "1039952",
                    "desc": "IMO",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "telegram",
                    "app_type": "1030063",
                    "desc": "Telegram",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "potato",
                    "app_type": "1030219",
                    "desc": "土豆聊天",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "SHOPPING",
            "desc": "电子商务",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "taobao",
                    "app_type": "1220007",
                    "desc": "淘宝",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "tmall",
                    "app_type": "1220002",
                    "desc": "天猫",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "jd",
                    "app_type": "1220005",
                    "desc": "京东",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "suning",
                    "app_type": "1220006",
                    "desc": "苏宁易购",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "dangdang",
                    "app_type": "1220001",
                    "desc": "当当",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "dianping",
                    "app_type": "1220050",
                    "desc": "大众点评",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "meituan",
                    "app_type": "1220040",
                    "desc": "美团",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "eleme",
                    "app_type": "1229997",
                    "desc": "饿了么",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "meituanwaimai",
                    "app_type": "1229996",
                    "desc": "美团外卖",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "BROWSER",
            "desc": "浏览器",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "browser",
                    "app_type": "1569998",
                    "desc": "默认浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "chrome",
                    "app_type": "1560019",
                    "desc": "Chrome",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "opera",
                    "app_type": "1560007",
                    "desc": "欧朋浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "uc-web",
                    "app_type": "1560013",
                    "desc": "UC浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qq-browser",
                    "app_type": "1560011",
                    "desc": "QQ浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidu-browser",
                    "app_type": "1560001",
                    "desc": "百度浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "dolphin",
                    "app_type": "1560021",
                    "desc": "海豚浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "cheetah",
                    "app_type": "1560003",
                    "desc": "猎豹浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "sogou-browser",
                    "app_type": "1560002",
                    "desc": "搜狗浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidutieba",
                    "app_type": "1070006",
                    "desc": "百度贴吧",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidu-mobile",
                    "app_type": "1560025",
                    "desc": "手机百度",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qh-browser",
                    "app_type": "1560004",
                    "desc": "360浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "EMAIL",
            "desc": "邮件",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "email",
                    "app_type": "01003",
                    "desc": "自带邮件",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qq-email",
                    "app_type": "01007",
                    "desc": "QQ邮箱",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "netease-master",
                    "app_type": "01996",
                    "desc": "网易邮箱大师",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "netease-email",
                    "app_type": "01997",
                    "desc": "网易邮箱",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "WEIBO",
            "desc": "社交网络",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "weibo",
                    "app_type": "1330001",
                    "desc": "新浪微博",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "tt",
                    "app_type": "1330002",
                    "desc": "腾讯微博",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "twitter",
                    "app_type": "1330005",
                    "desc": "Twitter",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "MAP",
            "desc": "地图",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "baidu-map",
                    "app_type": "1440004",
                    "desc": "百度地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "google-map",
                    "app_type": "1440001",
                    "desc": "Google地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "amap",
                    "app_type": "1440003",
                    "desc": "高德地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "sougou-map",
                    "app_type": "1440005",
                    "desc": "搜狗地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "soso-map",
                    "app_type": "1449998",
                    "desc": "腾讯地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "app_type": "9980001",
            "name": "TRAVEL",
            "desc": "行程",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": true,
            "app_list": [
                {
                    "name": "umetrip",
                    "app_type": "1260010",
                    "desc": "航旅纵横",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "didicar",
                    "app_type": "1520001",
                    "desc": "滴滴打车",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kuaidi",
                    "app_type": "1520002",
                    "desc": "快的打车",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "ctrip",
                    "app_type": "1260004",
                    "desc": "携程旅行",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qunar",
                    "app_type": "1260007",
                    "desc": "去哪儿",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "elong",
                    "app_type": "1260006",
                    "desc": "艺龙旅行",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "veryzhun",
                    "app_type": "1260011",
                    "desc": "飞常准",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "rails12306",
                    "app_type": "1260008",
                    "desc": "铁路12306",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "caocao",
                    "app_type": "1269998",
                    "desc": "曹操专车",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "hangban",
                    "app_type": "1269997",
                    "desc": "航班管家",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "NETDISK",
            "desc": "网盘",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "baidupan",
                    "app_type": "1280015",
                    "desc": "百度网盘",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "youdaonote",
                    "app_type": "1289998",
                    "desc": "有道云笔记",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        },
        {
            "class": "APP",
            "name": "KeyboardInput",
            "desc": "输入法",
            "select": 1,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "sogou-input",
                    "app_type": "1420005",
                    "desc": "搜狗输入法",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidu-input",
                    "app_type": "1420093",
                    "desc": "百度输入法",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                }
            ]
        }
    ]
};

export { apps };
export default config;