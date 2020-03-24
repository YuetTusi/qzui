interface IApps {
    [prop: string]: any;
}
//rpcUri: "tcp4://192.168.1.254:41622/",
//111.197.150.214
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
                    "packages": ["base"],
                    "app_id": "phone_base",
                    "desc": "基本信息",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "sms",
                    "packages": ["com.android.providers.telephony"],
                    "app_id": "9980002",
                    "desc": "短信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "contact",
                    "packages": ["com.android.providers.contacts", "com.motorola.blur.providers.contacts"],
                    "app_id": "9280001",
                    "desc": "通讯录",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "calllog",
                    "packages": ["com.sec.android.provider.logsprovider"],
                    "app_id": "9980007",
                    "desc": "通话记录",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "calendar",
                    "packages": ["com.android.providers.calendar"],
                    "app_id": "9980006",
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
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "sim",
                    "packages": ["sim"],
                    "app_id": "sim",
                    "desc": "SIM卡",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "wifi",
                    "packages": ["ANDROID_WIFI"],
                    "app_id": "9980005",
                    "desc": "WiFi",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "bluetooth",
                    "packages": ["com.android.bluetooth"],
                    "app_id": "9980004",
                    "desc": "蓝牙",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "appins",
                    "packages": ["installer"],
                    "app_id": "installed_app",
                    "desc": "安装应用",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "appaccount",
                    "packages": ["virtual"],
                    "app_id": "virtual",
                    "desc": "虚拟身份",
                    "select": 0,
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
            "desc": "媒体",
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "picture",
                    "packages": ["Picture"],
                    "desc": "图片",
                    "app_id": "media-image",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "video",
                    "packages": ["Video"],
                    "desc": "视频",
                    "app_id": "media-video",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "audio",
                    "packages": ["Audio"],
                    "desc": "音频",
                    "app_id": "media-audio",
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
            "name": "IM",
            "desc": "即时通讯",
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "wechat",
                    "packages": [
                        "com.tencent.mm",
                        "com.excelliance.dualaid",
                        "com.huihu.multplugin01",
                        "com.huihu.multplugin02",
                        "com.huihu.multplugin03",
                        "com.huihu.multplugin04",
                        "com.huihu.multplugin05",
                        "com.tencent.mm_cm",
                        "com.lbe.parallel"
                    ],
                    "app_id": "1030036",
                    "desc": "微信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qq",
                    "packages": [
                        "com.tencent.qq",
                        "com.tencent.mobileqq",
                        "com.tencent.minihd.qq",
                        "com.excelliance.dualaid",
                        "com.tencent.mobileqq_cm",
                        "com.lbe.parallel",
                    ],
                    "app_id": "1030001",
                    "desc": "QQ",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "alipay",
                    "packages": ["com.eg.android.AlipayGphone"],
                    "app_id": "1290007",
                    "desc": "支付宝",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "douyin",
                    "packages": ["com.ss.android.ugc.aweme"],
                    "app_id": "1400036",
                    "desc": "抖音",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kuaishou",
                    "packages": ["com.smile.gifmaker"],
                    "app_id": "1400026",
                    "desc": "快手",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "momo",
                    "packages": ["com.immomo.momo"],
                    "app_id": "1030044",
                    "desc": "陌陌",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "putong",
                    "packages": ["com.p1.mobile.putong"],
                    "app_id": "1030206",
                    "desc": "探探",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "whatsapp",
                    "packages": ["com.whatsapp"],
                    "app_id": "1030038",
                    "desc": "Whatsapp",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "blued",
                    "packages": ["com.soft.blued"],
                    "app_id": "1030146",
                    "desc": "Blued",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "keige",
                    "packages": ["com.tencent.karaoke"],
                    "app_id": "1390006",
                    "desc": "全民K歌",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "yy",
                    "packages": ["com.duowan.mobile"],
                    "app_id": "1030050",
                    "desc": "YY语音",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "yujian",
                    "packages": ["net.iaround"],
                    "app_id": "1030056",
                    "desc": "遇见",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "feixin",
                    "packages": ["cn.com.fetion"],
                    "app_id": "1030028",
                    "desc": "飞信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "skype",
                    "packages": ["com.skype.rover"],
                    "app_id": "1030027",
                    "desc": "Skype",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "miliao",
                    "packages": ["com.xiaomi.channel"],
                    "app_id": "1030035",
                    "desc": "米聊",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "line",
                    "packages": ["jp.naver.line.android"],
                    "app_id": "1030043",
                    "desc": "Line",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "facebook",
                    "packages": ["com.facebook.katana", "com.facebook.orca"],
                    "app_id": "1030045",
                    "desc": "Facebook",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "renren",
                    "packages": ["com.renren.mobile.android"],
                    "app_id": "1030046",
                    "desc": "人人",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "yixin",
                    "packages": ["im.yixin"],
                    "app_id": "1030047",
                    "desc": "易信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "laiwang",
                    "packages": ["com.alibaba.android.babylon"],
                    "app_id": "1030048",
                    "desc": "来往",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "wangxin",
                    "packages": ["com.alibaba.mobileim"],
                    "app_id": "1030049",
                    "desc": "旺信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "talkbox",
                    "packages": ["com.gtomato.talkbox"],
                    "app_id": "1030051",
                    "desc": "Talkbox",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "voxer",
                    "packages": ["com.rebelvox.voxer"],
                    "app_id": "1030052",
                    "desc": "Voxer",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "viber",
                    "packages": ["com.viber.voip"],
                    "app_id": "1030053",
                    "desc": "Viber",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "coco",
                    "packages": ["com.instanza.cocovoice"],
                    "app_id": "1030057",
                    "desc": "Coco",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kakao-talk",
                    "packages": ["com.kakao.talk", "com.kakao.group"],
                    "app_id": "1030058",
                    "desc": "KakaoTalk",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "raid-call",
                    "packages": ["raidcall.pack", "com.raidcall"],
                    "app_id": "1030059",
                    "desc": "RaidCall",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "youxin",
                    "packages": ["com.yx"],
                    "app_id": "1030060",
                    "desc": "有信",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "zello",
                    "packages": ["com.loudtalks"],
                    "app_id": "1030080",
                    "desc": "Zello",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "hello-talk",
                    "packages": ["com.hellotalk"],
                    "app_id": "1030083",
                    "desc": "HelloTalk",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kee-chat",
                    "packages": ["com.keechat.client"],
                    "app_id": "1039982",
                    "desc": "KeeChat",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "oovoo",
                    "packages": ["com.oovoo"],
                    "app_id": "1039981",
                    "desc": "Oovoo",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "didi",
                    "packages": ["com.didirelease.view"],
                    "app_id": "1039966",
                    "desc": "DiDi",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "nimbuzz",
                    "packages": ["com.nimbuzz"],
                    "app_id": "1039953",
                    "desc": "Nimbuzz",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "imo",
                    "packages": ["com.imo.android.imoim", "com.imo.android.imoimbeta"],
                    "app_id": "1039952",
                    "desc": "IMO",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "telegram",
                    "packages": ["org.telegram.messenger"],
                    "app_id": "1030063",
                    "desc": "Telegram",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "potato",
                    "packages": ["potato-chat"],
                    "app_id": "1030219",
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
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "taobao",
                    "packages": ["com.taobao.taobao"],
                    "app_id": "1220007",
                    "desc": "淘宝",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "tmall",
                    "packages": ["com.tmall.wireless"],
                    "app_id": "1220002",
                    "desc": "天猫",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "jd",
                    "packages": ["com.jingdong.app.mall"],
                    "app_id": "1220005",
                    "desc": "京东",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "suning",
                    "packages": ["com.suning.mobile.ebuy"],
                    "app_id": "1220006",
                    "desc": "苏宁易购",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "dangdang",
                    "packages": ["com.dangdang.buy2"],
                    "app_id": "1220001",
                    "desc": "当当",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "dianping",
                    "packages": ["com.dianping.v1"],
                    "app_id": "1220050",
                    "desc": "大众点评",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "meituan",
                    "packages": ["com.sankuai.meituan"],
                    "app_id": "1220040",
                    "desc": "美团",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "eleme",
                    "packages": ["me.ele"],
                    "app_id": "1229997",
                    "desc": "饿了么",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "meituanwaimai",
                    "packages": ["com.sankuai.meituan.takeoutnew"],
                    "app_id": "1229996",
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
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "browser",
                    "packages": ["com.android.browser", "com.sec.android.app.sbrowser"],
                    "app_id": "1569998",
                    "desc": "默认浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "chrome",
                    "packages": ["com.android.chrome"],
                    "app_id": "1560019",
                    "desc": "Chrome",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "opera",
                    "packages": ["com.oupeng.mini.android"],
                    "app_id": "1560007",
                    "desc": "Opera",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "uc-web",
                    "packages": ["com.UCMobile"],
                    "app_id": "1560013",
                    "desc": "UC浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qq-browser",
                    "packages": ["com.tencent.mtt"],
                    "app_id": "1560011",
                    "desc": "QQ浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidu-browser",
                    "packages": ["com.baidu.browser.apps"],
                    "app_id": "1560001",
                    "desc": "百度浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "dolphin",
                    "packages": [
                        "com.dolphin.browser.xf",
                        "com.dolphin.browser.express.web",
                        "com.dolphin.browser.tuna",
                        "mobi.mgeek.TunnyBrowser"
                    ],
                    "app_id": "1560021",
                    "desc": "海豚浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "cheetah",
                    "packages": ["com.ijinshan.browser_fast"],
                    "app_id": "1560003",
                    "desc": "猎豹浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "sogou-browser",
                    "packages": ["sogou.mobile.explorer"],
                    "app_id": "1560002",
                    "desc": "搜狗浏览器",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidutieba",
                    "packages": ["com.baidu.tieba"],
                    "app_id": "1070006",
                    "desc": "百度贴吧",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidu-mobile",
                    "packages": ["com.baidu.searchbox"],
                    "app_id": "1560025",
                    "desc": "手机百度",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qh-browser",
                    "packages": ["com.qihoo.appstore"],
                    "app_id": "1560004",
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
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "email",
                    "packages": [
                        "com.android.email",
                        "com.google.android.email",
                        "com.lenovo.email",
                        "com.htc.android.mail"
                    ],
                    "app_id": "01003",
                    "desc": "自带邮件",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qq-email",
                    "packages": ["com.tencent.androidqqmail"],
                    "app_id": "01007",
                    "desc": "QQ邮箱",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "netease-master",
                    "packages": ["com.netease.mail"],
                    "app_id": "01996",
                    "desc": "网易邮箱大师",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "netease-email",
                    "packages": ["com.netease.mobimail"],
                    "app_id": "01997",
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
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "weibo",
                    "packages": ["com.sina.weibo"],
                    "app_id": "1330001",
                    "desc": "新浪微博",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "tt",
                    "packages": ["com.tencent.WBlog"],
                    "app_id": "1330002",
                    "desc": "腾讯微博",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "twitter",
                    "packages": ["com.twitter.android"],
                    "app_id": "1330005",
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
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "baidu-map",
                    "packages": ["com.baidu.BaiduMap"],
                    "app_id": "1440004",
                    "desc": "百度地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "google-map",
                    "packages": ["com.google.android.apps.maps"],
                    "app_id": "1440001",
                    "desc": "Google地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "amap",
                    "packages": ["com.autonavi.minimap"],
                    "app_id": "1440003",
                    "desc": "高德地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "sougou-map",
                    "packages": ["com.sogou.map.android.maps"],
                    "app_id": "1440005",
                    "desc": "搜狗地图",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "soso-map",
                    "packages": ["com.tencent.map"],
                    "app_id": "1449998",
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
            "name": "TRAVEL",
            "desc": "行程",
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": true,
            "app_list": [
                {
                    "name": "umetrip",
                    "packages": ["com.umetrip.android.msky.app"],
                    "app_id": "1260010",
                    "desc": "航旅纵横",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "didicar",
                    "packages": ["com.sdu.didi.psnger"],
                    "app_id": "1520001",
                    "desc": "滴滴打车",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "kuaidi",
                    "packages": ["com.funcity.taxi.passenger"],
                    "app_id": "1520002",
                    "desc": "快的打车",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "ctrip",
                    "packages": ["ctrip.android.view"],
                    "app_id": "1260004",
                    "desc": "携程旅行",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "qunar",
                    "packages": ["com.Qunar"],
                    "app_id": "1260007",
                    "desc": "去哪儿",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "elong",
                    "packages": ["com.dp.android.elong"],
                    "app_id": "1260006",
                    "desc": "艺龙旅行",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "veryzhun",
                    "packages": ["vz.com"],
                    "app_id": "1260011",
                    "desc": "飞常准",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "rails12306",
                    "packages": ["com.MobileTicket"],
                    "app_id": "1260008",
                    "desc": "铁路12306",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "caocao",
                    "packages": ["cn.caocaokeji.user"],
                    "app_id": "1269998",
                    "desc": "曹操专车",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "hangban",
                    "packages": ["com.flightmanager.view"],
                    "app_id": "1269997",
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
            "desc": "网盘 & 笔记",
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "baidupan",
                    "packages": ["com.baidu.netdisk"],
                    "app_id": "1280015",
                    "desc": "百度网盘",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "youdaonote",
                    "packages": ["com.youdao.note"],
                    "app_id": "1289998",
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
            "select": 0,
            "state": 0,
            "state_text": "描述信息",
            "progress": 0,
            "progress_text": "描述信息",
            "open": false,
            "app_list": [
                {
                    "name": "sogou-input",
                    "packages": ["com.sohu.inputmethod.sogou"],
                    "app_id": "1420005",
                    "desc": "搜狗输入法",
                    "select": 0,
                    "state": 0,
                    "state_text": "描述信息",
                    "progress": 0,
                    "progress_text": "描述信息"
                },
                {
                    "name": "baidu-input",
                    "packages": ["com.baidu.input"],
                    "app_id": "1420093",
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