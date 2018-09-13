<style scoped lang="less" src="./RelationGraph.less"></style>
<template>
    <div id="graphPage">
        <link v-if="!firstShow" rel="stylesheet" type="text/css" :href="mapServerUrl+'/jsapi/3.14/dijit/themes/claro/claro.css'">
        <link v-if="!firstShow" rel="stylesheet" type="text/css" :href="mapServerUrl+'/jsapi/3.14/esri/css/esri.css'">
        <div class="relation-graph-title" v-if="firstShow">
            <h1><img src="@/images/relationGraph/logo.png" height="60" width="60">关系图谱</h1>
        </div>
        <search-input placeholder="请输入简单的关键词，如姓名或身份证号或手机号" :enter="search" type="large" :btnText="btnText" :btnIcon="btnIcon" inputIcon="android-close" :class="{'top-left':!firstShow,'hide-icon':hideIconClass}" :searchText.sync="searchText" :btnClick="search" :inputIconClick="clearText" @keyup.native='showIcon' />
        <p v-if="firstShow" class="toggle-rule" @click="showRules=!showRules;">
            <span>{{showRules?'收起':'展开'}}规则说明</span>
            <Icon :type="showRules?'ios-arrow-up':'ios-arrow-down'"></Icon>
        </p>
        <transition name="fade">
            <div class="rule-wrapper" v-show="showRules && firstShow">
                <p>
                    <Icon type="information-circled"></Icon><span>检索规则说明：</span></p>
                <ol class="rule-list">
                    <li class="rule-item">1、输入完整证件号码，如：320106196806050014</li>
                    <li class="rule-item">2、输入姓名，如：张三</li>
                    <li class="rule-item">3、输入手机号码，如：13584565465</li>
                </ol>
            </div>
        </transition>
        <div v-if="!firstShow" id="graph" @click.stop="accompanyFormShow=false;contextmenuShow=false;"></div>
        <transition name="slide-right">
            <Card v-show="nodeDetailShow" class="node-detail-panel">
                <div class="toggle-btn" @click="nodeDetailShow=false;">
                    <Icon type="arrow-right-b"></Icon>
                </div>
                <p slot="title">
                    {{nodeDetailTitle}}
                </p>
                <div class="node-detail-top" v-if="graphDatas[selectNodeIndex]" v-show="nodeDetailTopHeight>0" :style="{height:nodeDetailTopHeight+'px'}">
                    <div class="person-detail-top" v-if="isPersonDetail">
                        <img v-if="graphDatas[selectNodeIndex].data.rytpdz" class="avatar" :src="graphDatas[selectNodeIndex].data.rytpdz" width="50" height="67" @error="graphDatas[selectNodeIndex].data.rytpdz='';" />
                        <div v-else class="avatar avatar-default"></div>
                        <div class="avatar-right">
                            <p><span><i>姓名：</i><i>{{graphDatas[selectNodeIndex].data.xm}}</i></span><span><i>性别：</i><i>{{graphDatas[selectNodeIndex].data.xb}}</i></span></p>
                            <p><i>身份证号：</i><i>{{graphDatas[selectNodeIndex].data.gmsfhm}}</i></p>
                            <p><i>人员类型：</i><i>{{graphDatas[selectNodeIndex].data.personDesc}}</i></p>
                        </div>
                        <Button type="success" @click="activityAnalyse">
                            <Icon type="ios-list-outline"></Icon>
                            <span>活动分析</span>
                        </Button>
                    </div>
                    <div class="phone-detail-top" v-if="isPhoneDetail">
                        <p><span><i>手机号：</i><i>{{graphDatas[selectNodeIndex].data.phoneNumber}}</i></span><span><i>机主姓名：</i><i>{{graphDatas[selectNodeIndex].data.householdName}}</i></span></p>
                    </div>
                </div>
                <Table :class="{'no-table':!isPhoneDetail}" :stripe="isPhoneDetail" :highlight-row="isPhoneDetail" @on-row-click="locateMap" :show-header="!hideTableHeader" size="small" :columns="nodeDetailColumns" :data="nodeDetailData" :height="detailPanelHeight"></Table>
                <div id="map" v-show="mapShow"></div>
            </Card>
        </transition>
        <transition name="fade">
            <ul class="contextmenu" v-show="contextmenuShow" :style="{'top':contextmenuTop+'px','left':contextmenuLeft+'px'}">
                <li class="contextmenu-item" @click="toggleChildNode">{{childrenVisible?'收起节点':'展开节点'}}</li>
                <li class="contextmenu-item" @click="activityAnalyse">活动分析</li>
            </ul>
        </transition>
        <transition name="fade">
            <Collapse value="nameList" v-show="peopleList.length>0" class="name-collapse">
                <Panel name="nameList">
                    共找到 <span class="num">{{peopleList.length}}</span> 个搜索结果
                    <div slot="content">
                        <Card v-for="(people,index) in peopleList" :key="index" @click.native="getRelation(people.gmsfhm,undefined,true);">
                            <p><span class="name"><i>姓名：</i><i>{{people.xm}}</i></span><span class="gender"><i>性别：</i><i>{{people.xb}}</i></span></p>
                            <p><i>身份证号：</i><i>{{people.gmsfhm}}</i></p>
                            <p><i>手机号：</i><i>{{people.llsj}}</i></p>
                        </Card>
                    </div>
                </Panel>
            </Collapse>
        </transition>
        <Card v-show="accompanyFormShow" class="accompany-form" :class="{'offset-right':nodeDetailShow}">
            <p>
                <span class="label">开始时间：</span>
                <DatePicker confirm :editable="false" @on-change="txStartDateChange" :value="txStartDate" type="datetime" :options="dateOpt" placeholder="请选择开始日期"></DatePicker>
            </p>
            <p>
                <span class="label">结束时间：</span>
                <DatePicker confirm :editable="false" @on-change="txEndDateChange" :value="txEndDate" type="datetime" :options="dateOpt" placeholder="请选择结束日期"></DatePicker>
            </p>
            <p>
                <span class="label">同行频次：</span>
                <Select v-model="frequency">
                    <Option v-for="(item,index) in frequencyList" :value="item.value" :key="index">{{item.text}}</Option>
                </Select>
            </p>
            <span class="label">同行方式：</span>
            <CheckboxGroup v-model="txType" class="accompany-mode">
                <Checkbox v-for="(item,index) in txTypeList" :key="index" :label="item.value">{{item.name}}</Checkbox>
            </CheckboxGroup>
            <div class="btn-wrapper">
                <Button type="primary" @click="searchAccompany">查询</Button>
            </div>
        </Card>
        <analyse-detail :graphData="graphDatas[selectNodeIndex]" :startDate.sync="hdStartDate" :endDate.sync="hdEndDate" :option.sync="activity" @search="searchActivity" :personName="analyseModalPersonName" :modal.sync="activityModal" :categoryList="activityType" :recordList="activitySequence" />
        <analyse-detail :personName="analyseModalPersonName" :bids="bids" mode="accompany" :option.sync="accompanyType" :modal.sync="accompanyModal" />
        <div class="top-header" v-if="!firstShow">
            <Button :class="{'offset-right':nodeDetailShow}" @click.native.stop="accompanyFormShow = !accompanyFormShow;" type="text">
                同行分析
                <Icon :type="accompanyFormShow?'chevron-up':'chevron-down'"></Icon>
            </Button>
        </div>
        <transition name="fade">
            <div v-show="searchList.length>1" class="search-list-collapse">
                <div class="search-list-title" @click="searchListShow=!searchListShow;"><span>人员</span>
                    <Icon :type="searchListShow?'ios-arrow-up':'ios-arrow-down'"></Icon>
                </div>
                <transition name="slide-up">
                    <ul class="search-list" v-show="searchListShow">
                        <li v-if="item.rootNode.gmsfhm != rootNode.gmsfhm" v-for="(item,index) in searchList" :key="index" @click="searchRecordClick(item)"><span>{{item.rootNode.xm}}</span>
                            <Icon type="ios-close-empty" @click.stop.native="searchList.splice(index,1)"></Icon>
                        </li>
                        <li class="clear-list" @click="clearSearchList">
                            <p>清除</p>
                        </li>
                    </ul>
                </transition>
            </div>
        </transition>
    </div>
</template>
<script src="./RelationGraph"></script>
