<style scoped lang="less" src="./AnalyseDetail.less"></style>
<template>
    <Modal @on-visible-change="onVisibleChange" class="analyse-modal" v-model="modalCopy" :title="title">
        <div class="modal-header">
            <span class="name">{{personName}}&nbsp;&nbsp;|&nbsp;&nbsp;{{title}}明细</span>
            <label>{{selectLabel}}：</label>
            <Select v-model="optionCopy" @on-change="onSelectChange">
                <Option v-for="(item,index) in selectList" :value="item.value" :key="index">{{item.name}}</Option>
            </Select>
            <label v-if="mode=='activity'">日期：</label>
            <DatePicker v-if="mode=='activity'" :confirm="dateConfirm" :editable="dateEditable" @on-change="startDateChange" :value="startDateCopy" type="datetime" :options="dateOpt" placeholder="请选择开始日期"></DatePicker>
            <label v-if="mode=='activity'">至</label>
            <DatePicker v-if="mode=='activity'" :confirm="dateConfirm" :editable="dateEditable" @on-change="endDateChange" :value="endDateCopy" type="datetime" :options="dateOpt" placeholder="请选择结束日期"></DatePicker>
            <Button v-if="mode=='activity'" type="primary" @click="searchActivity">查询</Button>
        </div>
        <div class="modal-body">
            <div class="modal-body-left">
                <h4 class="modal-title">{{title}}统计</h4>
                <ul class="category-list">
                    <li v-for="(item,index) in categoryListCopy" :key="index"><span class="category">{{item.dataName}}</span><span class="count"><i>{{item.dataSize}}</i>次</span></li>
                </ul>
            </div>
            <div class="modal-body-right">
                <h4 class="modal-title">{{mode=='activity'?'活动时序图':'同行记录'}}</h4>
                <div ref="recordCon" class="analyse-table">
                    <div class="analyse-record" v-for="(item,index) in recordListCopy" :key="index">
                        <div class="date">{{item.time}}</div>
                        <div class="detail">
                            {{item.type}}&nbsp;&nbsp;———&nbsp;&nbsp;
                            <span>{{item.firstWord}}：</span>
                            <span>{{item.firstValue}}</span>
                            <span>{{item.secondWord}}：</span>
                            <span>{{item.secondValue}}</span>
                            <span>{{item.thirdWord}}：</span>
                            <span>{{item.thirdValue}}</span>
                            <span>{{item.forthWord}}：</span>
                            <span>{{item.forthValue}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Spin fix v-show="spinShow"></Spin>
    </Modal>
</template>
<script>
import {
    deepCopy
}
from '@/services/utils';
import {
    getPeerAnalysisRecordList
}
from '@/services/getData';
import {
    activityList,
    txTypeList
}
from '@/config/baseConfig';
export default {
    name: 'AnalyseDetail',
    props: {
        bids: {
            type: Array,
            default () {
                return [];
            }
        },
        modal: {
            type: Boolean,
            default: false
        },
        mode: {
            type: String,
            default: 'activity'
        },
        categoryList: {
            type: Array,
            default () {
                return [];
            }
        },
        recordList: {
            type: Array,
            default () {
                return [];
            }
        },
        personName: String,
        startDate: String,
        endDate: String,
        option: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            spinShow: false,
            dateConfirm: true,
            dateEditable: false,
            allAccompanyRecordList: [],
            categoryListCopy: this.categoryList,
            recordListCopy: this.recordList,
            dateOpt: {
                disabledDate(date) {
                    // return date && date.valueOf() > Date.now();
                }
            }
        }
    },
    watch: {
        recordList(val) {
            this.$refs.recordCon.scrollTop = 0;
            this.recordListCopy = val;
        },
        categoryList(val) {
            this.categoryListCopy = val;
        }
    },
    computed: {
        modalCopy: {
            get() {
                return this.modal;
            },
            set() {}
        },
        title() {
            return this.mode == 'activity' ? '活动分析' : '同行分析';
        },
        selectLabel() {
            return this.mode == 'activity' ? '活动类型' : '同行类型';
        },
        selectList() {
            let selectList = [];
            if (this.mode == 'activity') {
                selectList = deepCopy(activityList);
            } else {
                selectList = deepCopy(txTypeList);
                selectList.unshift({
                    name: '全部',
                    value: 0
                });
            }
            return selectList;
        },
        optionCopy: {
            get() {
                return this.option;
            },
            set() {}
        },
        startDateCopy() {
            return this.startDate;
        },
        endDateCopy() {
            return this.endDate;
        }
    },
    methods: {
        onVisibleChange(val) {
            if (val && this.mode == 'accompany') {
                this.spinShow = true;
                this.allAccompanyRecordList = [];
                this.onSelectChange(this.optionCopy);
            }
            this.$emit('update:modal', val);
        },
        onSelectChange(val) {
            if (this.mode == 'accompany') {
                if (this.allAccompanyRecordList.length > 0) {
                    this.recordListCopy = this.allAccompanyRecordList.filter(item => !val || (item.type == this.selectList[+val].name), this);
                } else {
                    getPeerAnalysisRecordList(JSON.stringify({
                        data: this.bids
                    })).then(res => {
                        const { code, data } = res;
                        if (!code && data) {
                            this.allAccompanyRecordList = data;
                            this.categoryListCopy = [];
                            txTypeList.map(({name})=>{
                                this.categoryListCopy.push({
                                    dataName: name,
                                    dataSize: data.filter(item => item.type == name, this).length
                                });
                            });
                            this.recordListCopy = this.allAccompanyRecordList.filter(item => !val || item.type == this.selectList[+val].name, this);
                        }
                        this.spinShow = false;
                    }).catch(e => {
                        this.spinShow = false;
                        console.error(e);
                    });
                }
            }
            this.$emit('update:option', val);
        },
        startDateChange(date) {
            this.$emit('update:startDate', date);
        },
        endDateChange(date) {
            this.$emit('update:endDate', date);
        },
        searchActivity() {
            if (!this.startDate) return this.$Message.warning('请选择开始时间');
            if (!this.endDate) return this.$Message.warning('请选择结束时间');
            if (new Date(this.startDate) > new Date(this.endDate)) return this.$Message.warning('开始时间不得大于结束时间');
            this.$emit('search');
        }
    }
}

</script>
