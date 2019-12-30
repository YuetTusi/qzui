//IP地址
export var IP = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/;
//端口号
export var Port = /^\d{1,5}$/;
//检验员编号（6位数字）
export var PoliceNo = /^\d{6}$/;
//电子邮件
export var EMail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
//匹配下划线左侧的所有字符
export var LeftUnderline = /.*(?=_)/;