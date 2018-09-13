import carCrimeSrc from '@/images/relationGraph/car-crime.png';
import carKeySrc from '@/images/relationGraph/car-key.png';
import carDrugSrc from '@/images/relationGraph/car-drug.png';
import cardCrimeSrc from '@/images/relationGraph/card-crime.png';
import cardKeySrc from '@/images/relationGraph/card-key.png';
import cardDrugSrc from '@/images/relationGraph/card-drug.png';
import phoneCrimeSrc from '@/images/relationGraph/phone-crime.png';
import phoneKeySrc from '@/images/relationGraph/phone-key.png';
import phoneDrugSrc from '@/images/relationGraph/phone-drug.png';
import markerPng from '@/images/relationGraph/marker.png';

import SearchInput from '@/components/SearchInput/SearchInput';
import AnalyseDetail from '@/components/AnalyseDetail/AnalyseDetail';
import esriLoader from 'esri-loader';
import {
    getRelation,
    getCallRecordByPhoneNumber,
    getActivityDirectory,
    getPeerAnalysisByIdentityCard,
    getActivitySequence
    // getAirPeerRecordList,
    // getStayPeerRecordList,
    // getTrainPeerRecordList,
    // getInternetPeerRecordList
}
    from '@/services/getData';

import {
    // setStore,
    // getStore,
    // removeStore,
    deepCopy,
    addEvent,
    throttle
}
    from '@/services/utils';

import {
    GRAPH_PERSON_DESC,
    GRAPH_NODE_ICON,
    GRAPH_COLOR,
    GRAPH_PERSON_TYPE,
    GRAPH_NODE_TYPE,
    ACCOMPANY_LINE_TYPE,
    frequencyList,
    personFieldMap,
    bankFieldMap,
    caseFieldMap,
    carFieldMap,
    phoneFieldMap,
    graphNodeCategories,
    txTypeList,
    hiddenNodeStyle,
    hiddenLineStyle,
    hiddenEdgeLabelStyle,
    highlightNodeStyle,
    normalNodeStyle,
    normalLabelStyle,
    normalEdgeLabelStyle,
    normalLineStyle,
    curveLineStyle,
    activityList
}
    from '@/config/baseConfig';

const headerHeight = 50;
const footerHeight = 30;
const nodeDetailTitleHeight = 35;
const docEle = document.documentElement || document.body;

let mapPromise, graph, GisObject;
let endDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
let startDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7).Format('yyyy-MM-dd hh:mm:ss');
export default {
    components: {
        SearchInput,
        AnalyseDetail
    },
    data() {
        return {
            currentRow: {},
            searchListShow: true,
            btnIcon: 'ios-search-strong',
            btnText: '',
            graphNodeCategories: deepCopy(graphNodeCategories),
            mapServerUrl,
            analyseModalPersonName: '',
            bids: [],
            nodeNameList: {},
            accompanyModal: false,
            accompanyDetailColumns: [],
            accompanyDetailData: [],
            isPersonDetail: false,
            isPhoneDetail: false,
            nodeDetailTopShow: false,
            nodeDetailTopHeight: 0,
            showRules: false,
            childrenVisible: false,
            timeout: null,
            rootNode: {},
            allActivity: [],
            activity: activityList[0].value,
            activityModal: false,
            contextmenuTop: 0,
            contextmenuLeft: 0,
            mapShow: false,
            accompanyFormShow: false,
            contextmenuShow: false,
            selectNodeIndex: 0,
            hideTableHeader: false,
            activityList,
            frequencyList,
            txTypeList,
            activityType: [],
            activitySequence: [],
            txType: [1],
            accompanyType: 0,
            frequency: 1,
            firstShow: true,
            hideIconClass: true,
            searchText: '',
            nodeDetailShow: false,
            nodeDetailTitle: '人员信息',
            nodeDetailColumns: [],
            nodeDetailData: [],
            peopleList: [],
            linkMap: {}, //源节点index对应目标节点index数组
            nodeMap: {}, //根据id和type对应节点index
            nodeIndexTree: {}, //节点树
            graphDatas: [], //所有节点数组
            graphEdges: [], //所有线段数组
            edgeNumMap: {}, //记录每个节点身上所连接的线条数
            txStartDate: startDate,
            hdStartDate: startDate,
            txEndDate: endDate,
            hdEndDate: endDate,
            dateOpt: {
                disabledDate(date) {
                    // return date && date.valueOf() > Date.now();
                }
            },
            searchList: []
        }
    },
    computed: {
        mapHeight() {
            return this.mapShow ? 300 : 0;
        },
        detailPanelHeight: {
            get() {
                return docEle.clientHeight - headerHeight - footerHeight - this.mapHeight - this.nodeDetailTopHeight - nodeDetailTitleHeight;
            },
            set(newVal) { }
        }
    },
    mounted() {
        mapPromise = esriLoader.loadModules(["extras/MapInitObject"], dojoConfig);
        this.$Message.config({
            top: 80
        });
        this.detailPanelHeight = docEle.clientHeight - headerHeight - footerHeight - nodeDetailTitleHeight - this.mapHeight - this.nodeDetailTopHeight;
        addEvent(window, 'resize', throttle(() => {
            this.detailPanelHeight = docEle.clientHeight - headerHeight - footerHeight - nodeDetailTitleHeight - this.mapHeight - this.nodeDetailTopHeight;
            graph && graph.resize();
        }));
    },
    watch: {
        mapShow(show) {
            if (!GisObject && show) {
                mapPromise.then(([MapInitObject]) => {
                    GisObject = new MapInitObject("map", {
                        minZoom: 1,
                        nav: false,
                        slider: false
                    });
                    GisObject.addDefaultLayers();
                    this.addGraphic();
                });
            }
        }
    },
    methods: {
        clearSearchList() {
            let arr = [];
            for (let i of this.searchList) {
                if (i.rootNode.gmsfhm == this.rootNode.gmsfhm) {
                    arr.push(i);
                    break;
                }
            }
            this.searchList = arr;
        },
        addGraphic() {
            if (GisObject) {
                const { jd, wd } = this.currentRow;
                let layer = GisObject.map.getLayer('layer');
                if (!layer) {
                    layer = new esri.layers.GraphicsLayer({
                        id: 'layer'
                    });
                    GisObject.map.addLayer(layer);
                }
                let point = new esri.geometry.Point(jd, wd);
                let graphic = layer.graphics[0];
                if (graphic) {
                    graphic.setGeometry(point);
                } else {
                    layer.add(new esri.Graphic(point, new esri.symbol.PictureMarkerSymbol({
                        url: markerPng,
                        height: 32,
                        width: 30,
                        type: "esriPMS"
                    })));
                }
                GisObject.map.centerAndZoom(point, 5);
            }
        },
        searchActivity() {
            let selectedNode = this.graphDatas[this.selectNodeIndex];
            if (selectedNode) {
                let idCard = selectedNode.data.gmsfhm;
                getActivityDirectory(idCard, this.hdStartDate, this.hdEndDate).then(res => {
                    const { data = [], code } = res;
                    this.activityType = data;
                    if (!code) {
                        this.analyseModalPersonName = selectedNode.data.xm;
                        getActivitySequence(idCard, +this.activity, this.hdStartDate, this.hdEndDate).then(res => {
                            this.activitySequence = res.data || [];
                            if (!res.code) {
                                this.activityModal = true;
                            }
                        }).catch(e => console.error(e));
                    }
                })
            }
        },
        toggleChildNode() {
            this.contextmenuShow = false;
            let selectNode = this.graphDatas[this.selectNodeIndex];
            if (selectNode.hasClick) {
                let isShow = !selectNode.childrenVisible;
                let childrenIndexList = this.getAllIndexFromNodeIndexTree(this.findNodeIndexTree(this.nodeIndexTree, this.selectNodeIndex), []);
                for (let i = 0, len = this.graphDatas.length; i < len; i++) {
                    let data = this.graphDatas[i];
                    if (childrenIndexList.indexOf(+data.index) > -1) {
                        data.itemStyle = isShow ? normalNodeStyle : hiddenNodeStyle;
                        data.visible = isShow;
                    }
                }
                for (let i = 0, len = this.graphEdges.length; i < len; i++) {
                    let data = this.graphEdges[i];
                    let personType = +data.personType;
                    if (data.source == this.selectNodeIndex || childrenIndexList.indexOf(+data.source) > -1 || childrenIndexList.indexOf(+data.target) > -1) {
                        if (isShow) {
                            data.lineStyle = deepCopy(normalLineStyle);
                            data.lineStyle.normal.color = data.lineStyle.emphasis.color = GRAPH_COLOR[personType];
                        } else {
                            data.lineStyle = hiddenLineStyle;
                        }
                        data.label = isShow ? normalEdgeLabelStyle : hiddenEdgeLabelStyle;
                    }
                }
                selectNode.childrenVisible = isShow;
                this.setGraphOptions();
            } else {
                this.getRelation(selectNode.data.gmsfhm, selectNode.index);
            }
        },
        findNodeIndexTree(nodeIndexTree, index) {
            if (!nodeIndexTree || isNaN(index) || index < 0) return false;
            for (let i in nodeIndexTree) {
                if (i == index) {
                    return nodeIndexTree[i];
                } else {
                    let obj = this.findNodeIndexTree(nodeIndexTree[i], index);
                    if (obj) {
                        return obj;
                    }
                }
            }
        },
        getAllIndexFromNodeIndexTree(nodeIndexTree, arr) {
            for (let i in nodeIndexTree) {
                if (arr.indexOf(i) < 0) {
                    arr.push(+i);
                }
                arr = arr.concat(this.getAllIndexFromNodeIndexTree(nodeIndexTree[i], []));
            }
            return arr;
        },
        locateMap(row, index) {
            this.currentRow = row;
            if (row.jd && row.wd) {
                this.mapShow = true;
                this.$nextTick(() => {
                    this.addGraphic();
                });
            } else {
                this.mapShow = false;
            }
        },
        activityAnalyse() {
            this.contextmenuShow = false;
            this.searchActivity();
        },
        txStartDateChange(date) {
            this.txStartDate = date;
        },
        txEndDateChange(date) {
            this.txEndDate = date;
        },
        searchAccompany() {
            if (!this.txStartDate) return this.$Message.warning('请选择开始时间');
            if (!this.txEndDate) return this.$Message.warning('请选择结束时间');
            if (new Date(this.txStartDate) > new Date(this.txEndDate)) return this.$Message.warning('开始时间不得大于结束时间');
            if (!this.frequency) return this.$Message.warning('请选择同行频次');
            if (!this.txType || this.txType.length <= 0) return this.$Message.warning('请选择同行方式');
            this.$Spin.show();
            this.rootNode && getPeerAnalysisByIdentityCard(this.rootNode.gmsfhm, this.txStartDate, this.txEndDate, this.frequency, this.txType.join(',')).then(res => {
                this.$Spin.hide();
                const { code, data } = res;
                if (!code && data && data.links) {
                    this.clearAccompanyEdge();
                    this.setGraphData(data);
                }
            }).catch(e => {
                this.$Spin.hide();
                console.error(e);
            })
            setTimeout(() => {
                this.$Spin.hide();
            }, 15000);
        },
        clearText() {
            this.searchText = "";
            this.peopleList = [];
            this.hideIconClass = true;
        },
        showIcon() {
            this.hideIconClass = !this.searchText;
        },
        showEdgeDetailPanel(edge) {
            let { source, target, data } = edge;
            if (edge && data) {
                this.bids = data;
                this.analyseModalPersonName = `${this.graphDatas[+source].data.xm} - ${this.graphDatas[+target].data.xm}`;
                this.accompanyModal = true;
            }
        },
        showNodeDetailPanel(node) {
            if (!node || !node.data) return;
            this.nodeDetailShow = true;
            this.$nextTick(() => {
                let type = node.data.type;
                this.hideTableHeader = type != GRAPH_NODE_TYPE.PHONE;
                this.nodeDetailTitle = type == GRAPH_NODE_TYPE.PHONE ? '通话记录' : `${graphNodeCategories[node.category].name}信息`;
                this.nodeDetailData = [];
                this.nodeDetailColumns = [];
                this.mapShow = false;
                if (this.isPhoneDetail) {
                    if (node.data && node.data.phoneRecord) {
                        this.createPhoneRecord(node.data.phoneRecord);
                    } else {
                        getCallRecordByPhoneNumber(node.data.phoneNumber).then(res => {
                            const { code, data } = res;
                            if (!code && data) {
                                this.graphDatas[node.index].data.phoneRecord = data;
                                this.createPhoneRecord(data);
                            }
                        }).catch(e => console.error(e));
                    }
                } else {
                    this.nodeDetailColumns = [{
                        key: 'name',
                        title: '',
                        align: 'right'
                    }, {
                        key: 'value',
                        title: '',
                        align: 'left'
                    }];
                    let fieldMap;
                    switch (type) {
                        case GRAPH_NODE_TYPE.PERSON:
                            fieldMap = personFieldMap;
                            break;
                        case GRAPH_NODE_TYPE.CAR:
                            fieldMap = carFieldMap;
                            break;
                        case GRAPH_NODE_TYPE.CASE:
                            fieldMap = caseFieldMap;
                            break;
                        case GRAPH_NODE_TYPE.CARD:
                            fieldMap = bankFieldMap;
                            break;
                    }
                    for (let i in fieldMap) {
                        if (node.data[i]) {
                            this.nodeDetailData.push({
                                name: `${fieldMap[i]}：`,
                                value: node.data[i]
                            });
                        }
                    }
                }
            });
        },
        createPhoneRecord(data) {
            if (data && data.length > 0) {
                this.nodeDetailColumns = [{
                    align: "center",
                    key: 'dfhm',
                    width: 85,
                    title: phoneFieldMap['dfhm']
                }, {
                    align: "center",
                    key: 'hjlx',
                    width: 65,
                    title: phoneFieldMap['hjlx']
                }, {
                    align: "center",
                    key: 'kssj',
                    width: 75,
                    title: phoneFieldMap['kssj']
                }, {
                    align: "center",
                    key: 'thsc',
                    width: 75,
                    title: phoneFieldMap['thsc']
                }];
                for (let i = 0, len = data.length; i < len; i++) {
                    let record = data[i];
                    this.nodeDetailData.push({
                        dfhm: record.dfhm,
                        hjlx: record.hjlx,
                        kssj: new Date(+record.kssj).Format('yyyy-MM-dd hh:mm:ss'),
                        thsc: `${record.thsc}分钟`,
                        jd: +record.jd,
                        wd: +record.wd
                    });
                }
            }
        },
        clearAccompanyEdge() {
            let nodeIndexArr = [];
            for (let i = this.graphEdges.length - 1; i >= 0; i--) {
                let edge = this.graphEdges[i];
                let {
                    source,
                    target
                } = edge;
                if (edge.type) {
                    this.edgeNumMap[source] = +this.edgeNumMap[source] - 1;
                    if (!this.edgeNumMap[source] || !this.graphDatas[source]) Reflect.deleteProperty(this.edgeNumMap, source);
                    this.edgeNumMap[target] = +this.edgeNumMap[target] - 1;
                    if (!this.edgeNumMap[target] || !this.graphDatas[target]) Reflect.deleteProperty(this.edgeNumMap, target);
                    nodeIndexArr.indexOf(source) < 0 && nodeIndexArr.push(+source);
                    nodeIndexArr.indexOf(target) < 0 && nodeIndexArr.push(+target);
                    let targetArr = this.linkMap[+source];
                    targetArr.splice(targetArr.indexOf(+target), 1);
                    this.graphEdges.splice(i, 1);
                }
            }
            for (let a = 0, len = nodeIndexArr.length; a < len; a++) {
                let nodeIndex = nodeIndexArr[a];
                if (!this.edgeNumMap[nodeIndex]) {
                    let node = this.graphDatas[nodeIndex];
                    let nodeType = node.type;
                    let nodeId = node.data.id;
                    if (this.nodeMap[nodeType][nodeId] == nodeIndex) Reflect.deleteProperty(this.nodeMap[nodeType], nodeId);
                    delete this.findNodeIndexTree(this.nodeIndexTree, nodeIndex);
                    this.graphDatas.splice(nodeIndex, 1);
                }
            }
        },
        highlightNode(selectNodeIndex) {
            if (this.graphDatas && this.graphDatas[this.selectNodeIndex]) {
                this.graphDatas[this.selectNodeIndex].itemStyle = normalNodeStyle;
            }
            this.selectNodeIndex = selectNodeIndex;
            let selectNode = this.graphDatas[selectNodeIndex];
            selectNode.itemStyle = deepCopy(highlightNodeStyle);
            selectNode.itemStyle.normal.shadowColor = selectNode.itemStyle.emphasis.shadowColor = GRAPH_COLOR[selectNode.data.personType];
            this.setGraphOptions();
        },
        resetData() {
            this.nodeDetailShow = this.accompanyFormShow = false;
            this.peopleList = [];
            this.linkMap = {};
            this.nodeMap = {};
            this.graphDatas = [];
            this.graphEdges = [];
            this.nodeNameList = [];
            this.nodeIndexTree = {};
            this.edgeNumMap = {};
        },
        search() {
            if (!this.searchText) return this.$Message.warning('请输入查询信息');
            this.getRelation(this.searchText, undefined, true);
        },
        getRelation(searchText, index, isNewGraph) {
            getRelation(searchText).then(res => {
                this.clearText();
                this.firstShow = false;
                this.btnIcon = '';
                this.btnText = "搜索";
                this.$nextTick(() => {
                    const { data, code } = res;
                    if (!code && data) {
                        if (index > -1) {
                            let node = this.graphDatas[index];
                            node.hasClick = node.childrenVisible = true;
                        }
                        if (data.nodes && data.nodes.length > 0) {
                            !graph && this.createGraph();
                            this.setGraphData(data, isNewGraph);
                        } else {
                            this.$Message.info('暂无数据');
                        }
                    } else if (code == 99) { //搜名字出现重名
                        this.peopleList = data;
                    } else {
                        this.$Message.info('暂无数据');
                    }
                });
            }).catch(e => console.error(e));
        },
        createGraph() {
            let graphDom = document.getElementById('graph');
            if (!graphDom) return;
            graphDom.oncontextmenu = () => false;
            graph = this.$eCharts.init(graphDom);
            graph.on('dblclick', params => {
                this.timeout && clearTimeout(this.timeout);
                let node = params.data;
                if (node.visible) {
                    this.highlightNode(node.index);
                    if (params.dataType == 'node' && node && node.data) {
                        this.nodeDetailShow && this.showNodeDetailPanel(node);
                        if (node.data.hasChildNode && node.data.gmsfhm) {
                            this.toggleChildNode();
                        }
                    }
                }
            });
            graph.on('click', params => {
                this.timeout && clearTimeout(this.timeout);
                let data = params.data;
                let dataType = params.dataType;
                if (dataType == 'node') {
                    if (data && data.visible) {
                        let type = data.data.type;
                        this.isPersonDetail = type == GRAPH_NODE_TYPE.PERSON;
                        this.isPhoneDetail = type == GRAPH_NODE_TYPE.PHONE;
                        this.nodeDetailTopHeight = this.isPersonDetail ? 130 : (this.isPhoneDetail ? 35 : 0);
                        this.highlightNode(data.index);
                        this.timeout = setTimeout(() => {
                            this.showNodeDetailPanel(data);
                        }, 300);
                    }
                } else if (dataType == 'edge' && data) {
                    this.timeout = setTimeout(() => {
                        this.showEdgeDetailPanel(data);
                    }, 300);
                }
            });
            graph.on('contextmenu', params => {
                this.contextmenuShow = false;
                let node = params.data;
                if (node.visible) {
                    this.highlightNode(node.index);
                    if (params.dataType == 'node' && params.data && params.data.type == GRAPH_NODE_TYPE.PERSON) {
                        this.contextmenuShow = true;
                        this.childrenVisible = node.childrenVisible;
                        this.contextmenuTop = params.event.offsetY;
                        this.contextmenuLeft = params.event.offsetX;
                    }
                }
            });
            graph.on('legendselectchanged', params => {
                let name = params.name;
                for (let i = 0, len = graphNodeCategories.length; i < len; i++) {
                    let category = graphNodeCategories[i];
                    if (category.name == name) {
                        this.graphNodeCategories[i].icon = params.selected[name] ? category.icon : category.iconBlur;
                        break;
                    }
                }
                this.setGraphOptions();
            });
        },
        async setGraphData(data, isNewGraph) {
            let {
                nodes = [],
                links = []
            } = data;
            if (isNewGraph) {
                let rootNode = nodes[0] || {};
                for (let i of this.searchList) {
                    if (rootNode.gmsfhm == i.rootNode.gmsfhm) return;
                }
                this.resetData();
            }
            let newNodeIndex = this.handleNodeData(nodes, isNewGraph);
            let {
                source,
                personType
            } = this.handleLinkData(links, isNewGraph);
            await this.handleGraphData(newNodeIndex, source, personType);
            this.setGraphOptions();
            this.handleSearchRecord(isNewGraph);
        },
        handleNodeData(nodes, isNewGraph) {
            let newNodeIndex = [];
            for (let i = 0, len = nodes.length; i < len; i++) {
                let node = nodes[i],
                    obj = {};
                let type = +node.type;
                node.id = node.id || node.phoneNumber;
                if (this.nodeMap[type] && this.nodeMap[type][node.id] > -1) continue;
                obj.category = type;
                obj.type = type;
                obj.index = this.graphDatas.length;
                if (!this.nodeMap[type]) this.nodeMap[type] = {};
                this.nodeMap[type][node.id] = obj.index;
                if (type == GRAPH_NODE_TYPE.PERSON) {
                    obj.name = node.xm;
                    obj.value = node.gmsfhm;
                } else if (type == GRAPH_NODE_TYPE.CAR) {
                    obj.name = node.sf + node.hphm;
                    obj.value = node.jdcxh;
                } else if (type == GRAPH_NODE_TYPE.CASE) {
                    obj.name = node.ajlx;
                    obj.value = node.ajh;
                } else if (type == GRAPH_NODE_TYPE.CARD) {
                    obj.name = node.zhh;
                    obj.value = node.dhhm;
                } else if (type == GRAPH_NODE_TYPE.PHONE) {
                    obj.name = obj.value = node.phoneNumber;
                }
                if (this.nodeNameList[obj.name] === undefined) {
                    this.nodeNameList[obj.name] = 0;
                } else {
                    this.nodeNameList[obj.name]++;
                    obj.name = `${obj.name}(${this.nodeNameList[obj.name]})`;
                }
                obj.itemStyle = deepCopy(normalNodeStyle);
                obj.data = node;
                obj.visible = true;
                obj.childrenVisible = false;
                newNodeIndex.push(+obj.index);
                this.graphDatas.push(obj);
            }
            let rootNode = this.graphDatas[0];
            if (isNewGraph && rootNode) {
                rootNode.category = 0;
                rootNode.symbolSize = 70;
                rootNode.hasClick = rootNode.childrenVisible = true;
                let data = rootNode.data;
                this.rootNode = {
                    gmsfhm: data.gmsfhm,
                    xm: data.xm
                };
            }
            return newNodeIndex;
        },
        handleLinkData(links, isNewGraph) {
            let source, personType;
            for (let i = 0, len = links.length; i < len; i++) {
                let link = links[i],
                    obj = {};
                let linkType = link.type,
                    targetNode = link.target;
                if (!i) {
                    let sourceNode = link.source;
                    personType = +sourceNode.personType || +GRAPH_PERSON_TYPE.REGULAR;
                    let sourceId = sourceNode.id || sourceNode.phoneNumber;
                    source = +this.nodeMap[+sourceNode.type][sourceId];
                }
                targetNode.personType = targetNode.personType || personType;
                if (!this.linkMap[source]) this.linkMap[source] = [];
                let targetId = targetNode.id || targetNode.phoneNumber;
                let target = +this.nodeMap[+targetNode.type][targetId];
                if (source > -1 && target > -1) {
                    obj.label = deepCopy(normalEdgeLabelStyle);
                    if (!linkType) { //普通关系线条
                        if ((this.linkMap[source].indexOf(target) > -1 || (this.linkMap[target] && this.linkMap[target].indexOf(source) > -1))) continue;
                        this.linkMap[source].push(target);
                        obj.lineStyle = deepCopy(normalLineStyle);
                        obj.lineStyle.normal.color = obj.lineStyle.emphasis.color = GRAPH_COLOR[+personType];
                    } else { //同行关系线条
                        if (this.linkMap[source].indexOf(target) < 0) {
                            this.linkMap[source].push(target);
                        } else if (this.linkMap[target] && this.linkMap[target].indexOf(source) < 0) {
                            this.linkMap[target].push(source);
                        } else {
                            continue;
                        }
                        obj.lineStyle = deepCopy(curveLineStyle);
                    }
                    obj.personType = personType;
                    obj.source = source;
                    obj.target = target;
                    obj.type = linkType;
                    obj.data = link.data;
                    obj.relation = link.relation;
                    let sourceEdgeNum = this.edgeNumMap[source] || 0;
                    let targetEdgeNum = this.edgeNumMap[target] || 0;
                    this.edgeNumMap[source] = +sourceEdgeNum + 1;
                    this.edgeNumMap[target] = +targetEdgeNum + 1;
                    this.graphEdges.push(obj);
                }
            }
            return {
                source,
                personType
            };
        },
        async handleGraphData(newNodeIndex, source, personType = +GRAPH_PERSON_TYPE.REGULAR) {
            if (source === undefined) return;
            let indexTreeObj = this.findNodeIndexTree(this.nodeIndexTree, source);
            if (!indexTreeObj && !isNaN(source) && source > -1) {
                this.nodeIndexTree[+source] = {};
                indexTreeObj = this.nodeIndexTree[+source];
            }
            for (let index of newNodeIndex) {
                let graphData = this.graphDatas[index];
                let nodeData = graphData.data;
                nodeData.personType = nodeData.personType || personType;
                nodeData.personDesc = GRAPH_PERSON_DESC[nodeData.personType];
                let category = GRAPH_NODE_ICON[graphData.category];
                let src = (nodeData.rytpdz || nodeData.cltpdz || nodeData.ajtpdz) + '';
                graphData.symbol = await new Promise((resolve, reject) => {
                    let img = new Image();
                    img.onload = () => {
                        resolve(`image://${src}`);
                    };
                    img.onerror = () => {
                        resolve(category[nodeData.personType] || 'circle');
                    };
                    img.src = src;
                    setTimeout(img.onerror, 1000);
                });
                graphData.label = deepCopy(normalLabelStyle);
                graphData.label.normal.backgroundColor = graphData.label.emphasis.backgroundColor = GRAPH_COLOR[+nodeData.personType];
                if (graphData.type == GRAPH_NODE_TYPE.PERSON && nodeData.personType != GRAPH_PERSON_TYPE.REGULAR) {
                    graphData.name = `${graphData.name} - ${nodeData.personDesc.slice(0, -2)}`;
                }
                if (index != source) indexTreeObj[index] = {};
            }
        },
        handleSearchRecord(isNewGraph) {
            if (isNewGraph) {
                this.searchList.push({
                    rootNode: this.rootNode,
                    edgeNumMap: this.edgeNumMap,
                    nodeIndexTree: this.nodeIndexTree,
                    linkMap: this.linkMap,
                    nodeMap: this.nodeMap,
                    graphDatas: this.graphDatas,
                    graphEdges: this.graphEdges,
                    nodeNameList: this.nodeNameList
                });
            } else {
                for (let item of this.searchList) {
                    if (item.rootNode.gmsfhm === this.rootNode.gmsfhm) {
                        item.edgeNumMap = this.edgeNumMap;
                        item.nodeIndexTree = this.nodeIndexTree;
                        item.linkMap = this.linkMap;
                        item.nodeMap = this.nodeMap;
                        item.graphDatas = this.graphDatas;
                        item.graphEdges = this.graphEdges;
                        item.nodeNameList = this.nodeNameList;
                    }
                }
            }
        },
        searchRecordClick(item) {
            this.nodeDetailShow = this.accompanyFormShow = false;
            if (item.rootNode.gmsfhm != this.rootNode.gmsfhm) {
                this.rootNode = item.rootNode;
                this.edgeNumMap = item.edgeNumMap;
                this.nodeIndexTree = item.nodeIndexTree;
                this.linkMap = item.linkMap;
                this.nodeMap = item.nodeMap;
                this.graphDatas = item.graphDatas;
                this.graphEdges = item.graphEdges;
                this.nodeNameList = item.nodeNameList;
                this.setGraphOptions();
            }
        },
        setGraphOptions() {
            graph && graph.setOption({
                legend: {
                    inactiveColor: '#c8e8ed',
                    orient: 'horizontal',
                    left: 10,
                    bottom: 10,
                    itemWidth: 24,
                    itemHeight: 24,
                    data: this.graphNodeCategories
                },
                series: [{
                    type: 'graph',
                    layout: 'force',
                    data: this.graphDatas,
                    links: this.graphEdges,
                    categories: graphNodeCategories,
                    focusNodeAdjacency: false,
                    draggable: true,
                    nodeScaleRatio: 0,
                    roam: true,
                    force: {
                        gravity: 0,
                        repulsion: 50,
                        edgeLength: 180
                    },
                    symbolSize: 48
                }]
            });
        }
    }
}
