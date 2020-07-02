# 本地数据库表说明

以下表都为本地存储在NeDB下

## FetchLog

说明：采集日志表；存储采集完成后的日志

字段|类型|说明
---|---|---
m_strStartTime|string|开始采集时间
m_strFetchType|string|采集方式
m_strChecker|string|检验员
m_strVersion|string|程序版本
m_strIsCancel|string|是否用户取消采集
m_strFinishTime|string|结束时间
m_strCasePath|string|案件绝对路径
m_strPhonePath|string|手机绝对路径
m_strDeviceName|string|手机名称


## ParseLog

说明：解析日志表；存储解析完成后的日志

字段|类型|说明
---|---|---
strCase_|string|案件名称
strPhone_|string|手机名称
llParseStart_|string|解析开始时间
llParseEnd_|string|解析完成时间
isParseOk_|boolean|解析是否成功
llReportStart_|string|创建报告开始时间
llReportEnd_|string|创建报告结束时间
parseApps_|UIParseOneAppinfo[]|解析App信息
isparseok_|boolean|是否解析成功
strdec|string|描述信息



UIParseOneAppinfo说明：

字段|类型|说明
---|---|---
strAppName|string|解析的单个app名称
count_|number|解析的单个app数量

