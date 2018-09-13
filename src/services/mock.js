import Mock from 'mockjs';
const Random = Mock.Random;

Mock.mock('/mock/home/getPersonCountByAddress.action', {
    'code': 0,
    'data': {
        'flowNum|100000-1000000': 1,
        'householdNum|1000000-10000000': 1,
        'rows': [{
            'name': '广州白云',
            'value|9999-9999999': 1
        }, {
            'name': '广州增城',
            'value|9999-9999999': 1
        }, {
            'name': '广州从化',
            'value|9999-9999999': 1
        }, {
            'name': '广州荔湾',
            'value|9999-9999999': 1
        }, {
            'name': '广州天河',
            'value|9999-9999999': 1
        }, {
            'name': '广州越秀',
            'value|9999-9999999': 1
        }, {
            'name': '广州黄埔',
            'value|9999-9999999': 1
        }, {
            'name': '广州番禺',
            'value|9999-9999999': 1
        }, {
            'name': '广州海珠',
            'value|9999-9999999': 1
        }, {
            'name': '广州南沙',
            'value|9999-9999999': 1
        }, {
            'name': '广州花都',
            'value|9999-9999999': 1
        }]
    },
    'msg': Random.csentence(4)
});
