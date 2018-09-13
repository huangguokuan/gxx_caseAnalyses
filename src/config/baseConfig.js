import defaultAvatarSrc from '../images/relationGraph/avatar.png';
import avatarSrc from '../images/relationGraph/person.png';
import avatarBlurSrc from '../images/relationGraph/person-blur.png';
import carSrc from '../images/relationGraph/car.png';
import carBlurSrc from '../images/relationGraph/car-blur.png';
import carCrimeSrc from '../images/relationGraph/car-crime.png';
import carKeySrc from '../images/relationGraph/car-key.png';
import carDrugSrc from '../images/relationGraph/car-drug.png';
import caseSrc from '../images/relationGraph/case.png';
import caseBlurSrc from '../images/relationGraph/case-blur.png';
import cardSrc from '../images/relationGraph/card.png';
import cardBlurSrc from '../images/relationGraph/card-blur.png';
import cardCrimeSrc from '../images/relationGraph/card-crime.png';
import cardKeySrc from '../images/relationGraph/card-key.png';
import cardDrugSrc from '../images/relationGraph/card-drug.png';
import phoneSrc from '../images/relationGraph/phone.png';
import phoneBlurSrc from '../images/relationGraph/phone-blur.png';
import phoneCrimeSrc from '../images/relationGraph/phone-crime.png';
import phoneKeySrc from '../images/relationGraph/phone-key.png';
import phoneDrugSrc from '../images/relationGraph/phone-drug.png';

const graphNodeCategories = [{
    name: '',
    icon: ''
}, {
    name: '人员',
    iconBlur: 'image://' + avatarBlurSrc,
    icon: 'image://' + avatarSrc
}, {
    name: '汽车',
    iconBlur: 'image://' + carBlurSrc,
    icon: 'image://' + carSrc
}, {
    name: '案件',
    iconBlur: 'image://' + caseBlurSrc,
    icon: 'image://' + caseSrc
}, {
    name: '银行卡',
    iconBlur: 'image://' + cardBlurSrc,
    icon: 'image://' + cardSrc
}, {
    name: '电话',
    iconBlur: 'image://' + phoneBlurSrc,
    icon: 'image://' + phoneSrc
}];

const GRAPH_NODE_TYPE = {
    ROOT_PERSON:0,
    PERSON: 1,
    CAR: 2,
    CASE: 3,
    CARD: 4,
    PHONE: 5
};

const GRAPH_PERSON_TYPE = {
    IMPORTANT: 1,
    DRUG: 2,
    CRIME: 3,
    REGULAR: 4
};

const GRAPH_NODE_ICON = {
    [GRAPH_NODE_TYPE.ROOT_PERSON]: {
        [GRAPH_PERSON_TYPE.IMPORTANT]: 'image://' + defaultAvatarSrc,
        [GRAPH_PERSON_TYPE.DRUG]: 'image://' + defaultAvatarSrc,
        [GRAPH_PERSON_TYPE.CRIME]: 'image://' + defaultAvatarSrc,
        [GRAPH_PERSON_TYPE.REGULAR]: 'image://' + defaultAvatarSrc
    },
    [GRAPH_NODE_TYPE.PERSON]: {
        [GRAPH_PERSON_TYPE.IMPORTANT]: 'image://' + defaultAvatarSrc,
        [GRAPH_PERSON_TYPE.DRUG]: 'image://' + defaultAvatarSrc,
        [GRAPH_PERSON_TYPE.CRIME]: 'image://' + defaultAvatarSrc,
        [GRAPH_PERSON_TYPE.REGULAR]: 'image://' + defaultAvatarSrc
    },
    [GRAPH_NODE_TYPE.CAR]: {
        [GRAPH_PERSON_TYPE.IMPORTANT]: 'image://' + carKeySrc,
        [GRAPH_PERSON_TYPE.DRUG]: 'image://' + carDrugSrc,
        [GRAPH_PERSON_TYPE.CRIME]: 'image://' + carCrimeSrc,
        [GRAPH_PERSON_TYPE.REGULAR]: 'image://' + carSrc
    },
    [GRAPH_NODE_TYPE.CASE]: {
        [GRAPH_PERSON_TYPE.IMPORTANT]: 'image://' + caseSrc,
        [GRAPH_PERSON_TYPE.DRUG]: 'image://' + caseSrc,
        [GRAPH_PERSON_TYPE.CRIME]: 'image://' + caseSrc,
        [GRAPH_PERSON_TYPE.REGULAR]: 'image://' + caseSrc
    },
    [GRAPH_NODE_TYPE.CARD]: {
        [GRAPH_PERSON_TYPE.IMPORTANT]: 'image://' + cardKeySrc,
        [GRAPH_PERSON_TYPE.DRUG]: 'image://' + cardDrugSrc,
        [GRAPH_PERSON_TYPE.CRIME]: 'image://' + cardCrimeSrc,
        [GRAPH_PERSON_TYPE.REGULAR]: 'image://' + cardSrc
    },
    [GRAPH_NODE_TYPE.PHONE]: {
        [GRAPH_PERSON_TYPE.IMPORTANT]: 'image://' + phoneKeySrc,
        [GRAPH_PERSON_TYPE.DRUG]: 'image://' + phoneDrugSrc,
        [GRAPH_PERSON_TYPE.CRIME]: 'image://' + phoneCrimeSrc,
        [GRAPH_PERSON_TYPE.REGULAR]: 'image://' + phoneSrc
    }
};

const DATA_CATEGORY_TYPE = {
    IMPORTANT: 1,
    IMPORTANT_CONTACT: 2,
    IMPORTANT_CAR: 3,
    IMPORTANT_RELATION: 4,
    CAR: 5,
    DRUG: 6,
    DRUG_RELATED: 7,
    RESIDENT: 8,
    FLOW: 9,
    JURISDICTIONAL_UNIT: 10,
    CASE: 11,
    SUSPECT: 12,
    TERRORIST: 13,
    ALL: 14,
    ALL_PERSON: 15,
    ALL_CAR: 16,
    ALL_CASE: 17,
    IMPORTANT_PERSON: 18
};

const GRAPH_PERSON_DESC = {
    [GRAPH_PERSON_TYPE.IMPORTANT]: '重点人员',
    [GRAPH_PERSON_TYPE.DRUG]: '吸毒涉毒人员',
    [GRAPH_PERSON_TYPE.CRIME]: '有案底人员',
    [GRAPH_PERSON_TYPE.REGULAR]: '普通人员'
};

const ACCOMPANY_LINE_TYPE = {
    PLANE: 6,
    TRAIN: 7,
    ACCOMMADATION: 8,
    NETWORK: 9
};

const GRAPH_COLOR = {
    [GRAPH_PERSON_TYPE.IMPORTANT]: '#fe5e5b',
    [GRAPH_PERSON_TYPE.DRUG]: '#df88ff',
    [GRAPH_PERSON_TYPE.CRIME]: '#ff9d06',
    [GRAPH_PERSON_TYPE.REGULAR]: '#55b0ff'
};

const DATA_CATEGORY_TYPE_MAP = {
    [DATA_CATEGORY_TYPE.ALL_PERSON]: [
        DATA_CATEGORY_TYPE.IMPORTANT,
        DATA_CATEGORY_TYPE.IMPORTANT_CONTACT,
        DATA_CATEGORY_TYPE.IMPORTANT_CAR,
        DATA_CATEGORY_TYPE.IMPORTANT_RELATION,
        DATA_CATEGORY_TYPE.DRUG,
        DATA_CATEGORY_TYPE.DRUG_RELATED,
        DATA_CATEGORY_TYPE.RESIDENT,
        DATA_CATEGORY_TYPE.FLOW,
        DATA_CATEGORY_TYPE.JURISDICTIONAL_UNIT,
        DATA_CATEGORY_TYPE.SUSPECT,
        DATA_CATEGORY_TYPE.TERRORIST
    ],
    [DATA_CATEGORY_TYPE.ALL_CAR]: [
        DATA_CATEGORY_TYPE.CAR
    ],
    [DATA_CATEGORY_TYPE.ALL_CASE]: [
        DATA_CATEGORY_TYPE.CASE
    ]
};

const PERSON_TYPE = {
    [DATA_CATEGORY_TYPE.IMPORTANT]: '重点人员',
    [DATA_CATEGORY_TYPE.DRUG]: '吸毒人员',
    [DATA_CATEGORY_TYPE.DRUG_RELATED]: '涉毒人员',
    [DATA_CATEGORY_TYPE.FLOW]: '流动人员',
    [DATA_CATEGORY_TYPE.JURISDICTIONAL_UNIT]: '户籍人员'
};

const personFieldMap = {
    xm: '姓名',
    gmsfhm: '身份证号',
    cym: '曾用名',
    xb: '性别',
    mz: '民族',
    csrq: '出生日期',
    jggj: '籍贯国家（地区）',
    jgssx: '籍贯省市县（区）',
    hk: '户口',
    yhzgx: '与户主关系',
    hjd: '户籍地',
    hjszdxz: '户籍地详址',
    zzmm: '政治面貌',
    whcd: '文化程度',
    hyzk: '婚姻状况',
    llsj: '联系手机',
    fwcs: '服务处所',
    ssxjgajgdm: '所属公安机关机构代码',
    ssxjgajgmc: '所属公安机关名称',
    sspcsmc: '所属派出所名称',
    sspcsjgdm: '所属派出所机构代码'
};

const bankFieldMap = {
    hzmz: '户主名字',
    zhh: '账户号',
    yhmc: '银行名称',
    zhlx: '账户类型',
    khrq: '开户日期',
    dhhm: '电话号码',
    hmgsd: '号码归属地',
    zt: '状态',
    khidh: '客户 ID 号',
    zffs: '支付方式',
    sjywj: '数据源文件',
    imsih: 'IMSI号',
    simkh: 'sim 卡号',
    cjrq: '创建日期'
};

const suspectFieldMap = {
    xm: '姓名',
    xb: '性别',
    zjzl: '证件种类',
    zjhm: '证件号码',
    csrq: '出生日期',
    hjszdqh: '户籍所在地区划',
    hjszdxz: '户籍所在地详址',
    xxdzms: '详细地址描述/实际居住地',
    sjjzdxz: '实际居住地行政区划',
    whcd: '文化程度',
    mz: '民族',
    gj: '国籍（地区）',
    rybh: '人员编号',
    wgxbm: '务管辖部门',
    zwckbh: '指纹采卡编号',
    zwbh: '指纹编号',
    ywx: '英文姓',
    ywm: '英文名',
    bm: '别名',
    ch: '绰号',
    csrqxx: '出生日期下限',
    zc: '专长',
    xtbh: '系统编号'
};

const caseFieldMap = {
    ajbh: '案件编号',
    ajh: '案件号',
    ajmc: '案件名称',
    ajlx: '案件类型',
    ajzt: '案件状态',
    xtbh: '系统编号',
    sldw: '受理单位/接收单位',
    zazt: '作案状态',
    jjslh: '接警受理号',
    jjfs: '接警方式',
    ab: '案别/案由',
    zabz: '专案标识',
    bjsj: '报警时间',
    fxsj: '发现时间',
    fasjcz: '发案时间初值',
    fasjzz: '发案时间终值',
    faddQx: '发案地点_区县',
    faddJd: '发案地点_街道',
    ssjq: '所属警区',
    faddxz: '发案地点详址',
    sssq: '所属社区',
    fady: '发案地域（取消）',
    facs: '发案处所',
    fxxs: '发现形式',
    whcd: '危害程度',
    blyy: '补立原因',
    jyaq: '简要案情',
    zasj: '作案时机',
    xzcs: '选择处所',
    xzdx: '选择对象'
};

const carFieldMap = {
    sf: '省份',
    hphm: '号牌号码',
    cllx: '车辆类型',
    clxh: '车辆型号',
    csys32: '车身颜色32位',
    sfzmhm: '身份证明号码',
    sfzmmc: '身份证明名称',
    jdcsyr: '机动车所有人',
    syqsrq: '使用起始日期',
    yqjyqzbfqz: '逾期检验强制报废期止',
    yq2gjyzqz: '逾期2个检验周期截止',
    fdjgs: '发动机缸数',
    zxzcsfyzhgn: '专项做车是否有载货功能',
    zzjglx: '组织机构类型',
    sfwwxmbc: '是否为微型面包车',
    sfwncdqsy: '是否为农村地区使用',
    jsshpgzkrs: '驾驶室后排挂载客人数',
    hbdbqk: '环保达标情况',
    ccrq: '出厂日期',
    hdfs: '获得方式',
    pzbh: '凭证编号',
    xsdw: '销售单位',
    xsjg: '销售价格',
    xsrq: '销售日期',
    jkpz: '进口凭证',
    jkpzbh: '进口凭证编号',
    hgzbh: '合格证编号',
    nszm: '纳税证明',
    nszmbh: '纳税证明编号',
    gxrq: '更新日期',
    xgzl: '相关资料',
    qmbm: '前膜编号',
    hmbm: '后膜编号',
    bz: '备注',
    zsxzqh: '住所行政区划',
    zsxxdz: '住所详细地址',
    zsyzbm: '住所邮政编码',
    lxdh: '联系电话',
    zzjzzm: '暂住居住证明',
    zzxzqh: '暂住行政区划',
    zzxxdz: '暂住详细地址',
    zzyzbm: '暂住邮政编码',
    zdyzt: '自定义状态',
    yjdcxh: '原机动车序号',
    jyry: '查验人员',
    dphgzbh: '底盘合格证编号',
    sqdm: '社区代码',
    clyt: '车辆用途',
    ytsx: '用途属性',
    dzyx: '电子邮箱',
    xszzxbh: '行驶证证芯标号',
    sjhm: '手机号码',
    jyhgbz: '检验合格标志',
    dwbm: '单位编码',
    jdcxh: '机动车序号',
    hpzl: '号牌种类',
    zwpp: '中文品牌',
    ywpp: '英文品牌',
    gcorjk: '国产/进口',
    zzg: '制造国',
    zzsmc: '制造厂名称',
    clsbdh: '车辆识别代号',
    fdjh: '发动机号',
    syxz: '使用性质',
    syq: '所有权',
    ccdjrq: '初次登记日期',
    zjdjrq: '最近定检日期',
    jyyxqz: '检验有效期止',
    qzbfqz: '强制报废期止',
    fzjg: '发证机关',
    glbm: '管理部门',
    fprq: '发牌日期',
    fxszrq: '发行驶证日期',
    hdjzsrq: '发登记证书日期',
    fhgzrq: '发合格证日期',
    bxzzrq: '保险终止日期',
    blhpcs: '补领号牌次数',
    blxszcs: '补领行驶证次数',
    hlzhci: '补/换领证书次数',
    djzsbh: '登记证书编号',
    zdjzshs: '制登记证书行数',
    dabh: '档案编号',
    glxq: '管理辖区',
    jdczt: '机动车状态',
    jbr: '经办人',
    zclsh: '注册流水号',
    fdjxh: '发动机型号',
    rlzl: '燃料种类',
    pl: '排量',
    gl: '功率',
    zxxs: '转向形式',
    cwkc: '车外廓长',
    cwkk: '车外廓宽',
    cwkg: '车外廓高',
    hxnbcd: '货箱内部长度',
    hxnbkd: '货箱内部宽度',
    hxnbgd: '货箱内部高度',
    gbthps: '钢板弹簧片数',
    zs: '轴数',
    zj: '轴距',
    qlj: '前轮距',
    hlj: '后轮距',
    ltgg: '轮胎规格',
    lts: '轮胎数',
    zzl: '总质量',
    zbzl: '整备质量',
    hdzzl: '核定载质量',
    hdzk: '核定载客',
    zqyzzl: '准牵引总质量',
    jssqpzkrs: '驾驶室前排载客人数'
};

const phoneFieldMap = {
    rksj: '入库时间',
    kssj: '开始时间',
    thsc: '通话时长',
    xqbh: '小区编号',
    yhgsjdm: '用户归宿局代码',
    dfgsjdm: '对方归宿局代码',
    thszdqh: '通话所在地区号',
    wzqbm: '位置区编码',
    sjimsi: '手机 IMSI',
    sjimei: '手机 IMEI',
    jhjid: '交换机 ID',
    cly: '出路由',
    rly: '入路由',
    yhhm: '用户号码',
    dfhm: '对方号码',
    hjlx: '呼叫类型',
    zbjbz: '主被叫标志',
    hjms: '呼叫描述'
};



const frequencyList = [{
    text: '1次及以上',
    value: 1
}, {
    text: '2次及以上',
    value: 2
}, {
    text: '3次及以上',
    value: 3
}, {
    text: '4次及以上',
    value: 4
}, {
    text: '5次及以上',
    value: 5
}, {
    text: '6次及以上',
    value: 6
}];

const activityList = [{
    name: '全部',
    value: 5
}, {
    name: '火车出行',
    value: 0
}, {
    name: '飞机出行',
    value: 1
}, {
    name: '酒店住宿',
    value: 2
}, {
    name: '网吧上网',
    value: 3
}, {
    name: '手机通话',
    value: 4
}];

const txTypeList = [{
        name: '飞机同行',
        value: 1
    }, {
        name: '火车同行',
        value: 2
    }, {
        name: '住宿同行',
        value: 3
    }, {
        name: '同上网',
        value: 4
    }
];

const planeRecordColumn = [{
    type: 'index',
    fixed: 'left',
    width: 60,
    align: 'center'
}, {
    align: "center",
    key: 'ZWM',
    // width: 85,
    title: '姓名'
}, {
    align: "center",
    key: 'ZJH',
    // width: 75,
    title: '证件号'
}, {
    align: "center",
    key: 'HBH',
    // width: 75,
    title: '航班号'
}, {
    align: "center",
    key: 'HBRQ',
    // width: 75,
    title: '航班日期'
}, {
    align: "center",
    key: 'SFG',
    // width: 75,
    title: '始发港'
}, {
    align: "center",
    key: 'DDG',
    // width: 75,
    title: '到达港'
}, {
    align: "center",
    key: 'DDSJ',
    // width: 75,
    title: '到达时间'
}, {
    align: "center",
    key: 'DZBH',
    // width: 75,
    title: '订座编号'
}, {
    align: "center",
    key: 'DJPH',
    // width: 75,
    title: '登机牌号'
}, {
    align: "center",
    key: 'ZWH',
    // width: 75,
    title: '座位号'
}, {
    align: "center",
    key: 'CW',
    // width: 75,
    title: '舱位'
}, {
    align: "center",
    key: 'XLJS',
    // width: 75,
    title: '行李件数'
}, {
    align: "center",
    key: 'XLXX',
    // width: 75,
    title: '行李信息'
}];

const trainRecordColumns = [{
    type: 'index',
    fixed: 'left',
    width: 60,
    align: 'center'
}, {
    align: "center",
    key: 'XM',
    // width: 85,
    title: '姓名'
}, {
    align: "center",
    key: 'SFZH',
    // width: 75,
    title: '身份证号'
}, {
    align: "center",
    key: 'CCRQ',
    // width: 75,
    title: '乘车日期'
}, {
    align: "center",
    key: 'FCSJ',
    // width: 75,
    title: '发车时间'
}, {
    align: "center",
    key: 'CXH',
    // width: 75,
    title: '车厢号'
}, {
    align: "center",
    key: 'ZWH',
    // width: 75,
    title: '座位号'
}, {
    align: "center",
    key: 'SFZ',
    // width: 75,
    title: '始发站'
}, {
    align: "center",
    key: 'DDZ',
    // width: 75,
    title: '到达站'
}, {
    align: "center",
    key: 'CPBH',
    // width: 75,
    title: '车票编号'
}, {
    align: "center",
    key: 'SPSJ',
    // width: 75,
    title: '售票时间'
}, {
    align: "center",
    key: 'SPD',
    // width: 75,
    title: '售票点'
}, {
    align: "center",
    key: 'SPCK',
    // width: 75,
    title: '售票窗口'
}];

const accommadationRecordColumns = [{
    type: 'index',
    fixed: 'left',
    width: 60,
    align: 'center'
}, {
    align: "center",
    key: 'XM',
    // width: 85,
    title: '姓名'
}, {
    align: "center",
    key: 'GMSFHM',
    // width: 75,
    title: '身份证号'
}, {
    align: "center",
    key: 'RZSJ',
    // width: 75,
    title: '入住时间'
}, {
    align: "center",
    key: 'TFSJ',
    // width: 75,
    title: '退房时间'
}, {
    align: "center",
    key: 'RZLG',
    // width: 75,
    title: '入住旅馆'
}, {
    align: "center",
    key: 'RZFH',
    // width: 75,
    title: '入住房号'
}, {
    align: "center",
    key: 'LGMC',
    // width: 75,
    title: '旅馆名称'
}, {
    align: "center",
    key: 'RZDBRY',
    // width: 75,
    title: '入住当班人员'
}, {
    align: "center",
    key: 'DZ',
    // width: 75,
    title: '地址'
}];

const networkRecordColumns = [{
    type: 'index',
    fixed: 'left',
    width: 60,
    align: 'center'
}, {
    align: "center",
    key: 'SWRYXM',
    // width: 85,
    title: '姓名'
}, {
    align: "center",
    key: 'ZJLX',
    // width: 65,
    title: '证件类型'
}, {
    align: "center",
    key: 'ZJHM',
    // width: 75,
    title: '证件号码'
}, {
    align: "center",
    key: 'SWSESSIONID',
    // width: 75,
    title: '上网SESSION_ID'
}, {
    align: "center",
    key: 'MACDZ',
    // width: 75,
    title: 'Mac 地址'
}, {
    align: "center",
    key: 'SWSJ',
    // width: 75,
    title: '上网时间'
}, {
    align: "center",
    key: 'XWSJ',
    // width: 75,
    title: '下网时间'
}, {
    align: "center",
    key: 'WBMC',
    // width: 75,
    title: '网吧名称'
}, {
    align: "center",
    key: 'SWZDMC',
    // width: 75,
    title: '上网终端名称'
}, {
    align: "center",
    key: 'SWZDNWIP',
    // width: 75,
    title: '上网终端内网IP地址'
}];

const hiddenStyleObj = {
    color: 'transparent',
    opacity: 0,
    show: false
};
const hiddenNodeStyle = {
    normal: hiddenStyleObj,
    emphasis: hiddenStyleObj
};
const hiddenLineStyle = {
    normal: hiddenStyleObj,
    emphasis: hiddenStyleObj
};
const hiddenEdgeLabelStyle = {
    normal: hiddenStyleObj,
    emphasis: hiddenStyleObj
};

const normalLabelStyleObj = {
    show: true,
    position: 'bottom',
    distance: 7,
    color: '#fff',
    borderRadius: 5,
    padding: [2, 5]
};
const normalLabelStyle = {
    normal: normalLabelStyleObj,
    emphasis: normalLabelStyleObj
};

const normalNodeStyleObj = {
    shadowColor: 'rgba(255, 0, 0, 0)',
    shadowBlur: 0,
    borderWidth:3,
    borderColor:'#ff0000',
    opacity: 1
};
const normalNodeStyle = {
    normal: normalNodeStyleObj,
    emphasis: normalNodeStyleObj
};

const highlightNodeStyleObj = {
    shadowColor: 'rgba(255, 0, 0,1)',
    shadowBlur: 30,
    opacity: 1
};
const highlightNodeStyle = {
    normal: highlightNodeStyleObj,
    emphasis: highlightNodeStyleObj
};

const edgeLabelStyleObj = {
    backgroundColor: 'rgba(255,255,255,1)',
    show: true,
    fontSize: 14,
    padding: [10, 2, 0, 2],
    verticalAlign: 'middle',
    formatter: function(params) {
        if(params && params.data && params.data.relation) return params.data.relation;
        return '';
    }
};
const normalEdgeLabelStyle = {
    normal: edgeLabelStyleObj,
    emphasis: edgeLabelStyleObj
};

const lineStyleObj = {
    width: 2
};

const normalLineStyle = {
    normal: lineStyleObj,
    emphasis: lineStyleObj
};

const curveLineStyleObj = {
    width: 2,
    curveness: 0.2,
    color: '#3e81d2'
};
const curveLineStyle = {
    normal: curveLineStyleObj,
    emphasis: curveLineStyleObj
};

export {
    planeRecordColumn,
    trainRecordColumns,
    accommadationRecordColumns,
    networkRecordColumns,

    GRAPH_PERSON_DESC,
    GRAPH_NODE_ICON,
    GRAPH_NODE_TYPE,
    DATA_CATEGORY_TYPE,
    DATA_CATEGORY_TYPE_MAP,
    PERSON_TYPE,
    ACCOMPANY_LINE_TYPE,
    GRAPH_PERSON_TYPE,
    GRAPH_COLOR,

    activityList,
    normalLineStyle,
    curveLineStyle,
    normalEdgeLabelStyle,
    normalLabelStyle,
    hiddenNodeStyle,
    hiddenLineStyle,
    hiddenEdgeLabelStyle,
    highlightNodeStyle,
    normalNodeStyle,
    graphNodeCategories,
    personFieldMap,
    bankFieldMap,
    suspectFieldMap,
    carFieldMap,
    caseFieldMap,
    phoneFieldMap,
    frequencyList,
    txTypeList
};
