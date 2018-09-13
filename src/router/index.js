import Vue from 'vue';
import Router from 'vue-router';

const Home = resolve => require(['@/pages/home/Home.vue'], resolve);
const HomePage = resolve => require(['@/pages/homePage/HomePage.vue'], resolve);
const SystemManage = resolve => require(['@/pages/systemManage/SystemManage.vue'], resolve);
const ResourceSearch = resolve => require(['@/pages/resourceSearch/resourceSearch.vue'], resolve);
const PersonInfo = resolve => require(['@/pages/resourceSearch/personInfo/PersonInfo.vue'], resolve);
const CarInfo = resolve => require(['@/pages/resourceSearch/carInfo/CarInfo.vue'], resolve);
const TourInfo = resolve => require(['@/pages/resourceSearch/tourInfo/TourInfo.vue'], resolve);
const WifiInfo = resolve => require(['@/pages/resourceSearch/wifiInfo/WifiInfo.vue'], resolve);
const AlertControl = resolve => require(['@/pages/alertControl/AlertControl.vue'], resolve);
const PersonManage = resolve => require(['@/pages/alertControl/personManage/PersonManage.vue'], resolve);
const FaceAlert = resolve => require(['@/pages/alertControl/personManage/faceAlert/FaceAlert.vue'],resolve);
const ManageTask_Face = resolve => require(['@/pages/alertControl/personManage/manageTask/ManageTask.vue'],resolve);
const CarManage = resolve => require(['@/pages/alertControl/carManage/CarManage.vue'], resolve);
const CarAlert = resolve => require(['@/pages/alertControl/carManage/carAlert/CarAlert.vue'],resolve);
const ManageTask_Car = resolve => require(['@/pages/alertControl/carManage/manageTask/ManageTask.vue'],resolve);
const JudgeAnalyse = resolve => require(['@/pages/judgeAnalyse/JudgeAnalyse.vue'], resolve);
const RelationGraph = resolve => require(['@/pages/judgeAnalyse/relationGraph/RelationGraph.vue'], resolve);
const FaceTech = resolve => require(['@/pages/judgeAnalyse/faceTech/FaceTech.vue'], resolve);
const CarTech = resolve => require(['@/pages/judgeAnalyse/carTech/CarTech.vue'], resolve);
const IntegratedAnalyse = resolve => require(['@/pages/judgeAnalyse/integratedAnalyse/IntegratedAnalyse.vue'], resolve);
const WifiCar = resolve => require(['@/pages/judgeAnalyse/integratedAnalyse/wifiCar/WifiCar.vue'], resolve);
const WifiFace = resolve => require(['@/pages/judgeAnalyse/integratedAnalyse/wifiFace/WifiFace.vue'], resolve);
const PersonalWork = resolve => require(['@/pages/personalWork/PersonalWork.vue'], resolve);
Vue.use(Router);

const router = new Router({
    routes: [{
        path: '/',
        name: 'home',
        redirect: '/homePage',
        alias: ['/index'],
        component: Home,
        children: [{
            path: 'homePage',
            name: 'homePage',
            component: HomePage
        }, {
            path: 'alertControl',
            name: 'alertControl',
            component: AlertControl,
            redirect: '/alertControl/personManage',
            children: [{
                path: 'personManage',
                name: 'personManage',
                component: PersonManage,
                redirect: '/alertControl/personManage/faceAlert',
                children: [{
                    path: 'faceAlert',
                    name: 'faceAlert',
                    component: FaceAlert
                },{
                    path: 'manageTask',
                    name: 'manageTask',
                    component: ManageTask_Face
                }]
            }, {
                path: 'carManage',
                name: 'carManage',
                component: CarManage,
                redirect: '/alertControl/carManage/carAlert',
                children: [{
                    path: 'carAlert',
                    name: 'carAlert',
                    component: CarAlert
                },{
                    path: 'manageTask',
                    name: 'manageTask',
                    component: ManageTask_Car
                }]
            }]
        }, {
            path: 'systemManage',
            name: 'systemManage',
            component: SystemManage
        }, {
            path: 'resourceSearch',
            name: 'resourceSearch',
            component: ResourceSearch,
            redirect: '/resourceSearch/personInfo',
            children: [{
                path: 'personInfo',
                name: 'personInfo',
                component: PersonInfo
            }, {
                path: 'carInfo',
                name: 'carInfo',
                component: CarInfo
            }, {
                path: 'tourInfo',
                name: 'tourInfo',
                component: TourInfo
            }, {
                path: 'wifiInfo',
                name: 'wifiInfo',
                component: WifiInfo
            }]
        }, {
            path: 'judgeAnalyse',
            name: 'judgeAnalyse',
            component: JudgeAnalyse,
            redirect: '/judgeAnalyse/relationGraph',
            children: [{
                path: 'relationGraph',
                name: 'relationGraph',
                component: RelationGraph
            }, {
                path: 'faceTech',
                name: 'faceTech',
                component: FaceTech
            }, {
                path: 'carTech',
                name: 'carTech',
                component: CarTech
            }, {
                path: 'integratedAnalyse',
                name: 'integratedAnalyse',
                component: IntegratedAnalyse,
                redirect: '/judgeAnalyse/integratedAnalyse/wifiFace',
                children: [{
                    path: 'wifiFace',
                    name: 'wifiFace',
                    component: WifiFace
                }, {
                    path: 'wifiCar',
                    name: 'wifiCar',
                    component: WifiCar
                }]
            }]
        }, {
            path: 'personalWork',
            name: 'personalWork',
            component: PersonalWork
        }]
    }, {
        path: '*',
        redirect: '/'
    }]
});
/*router.beforeEach((to,from,next)=>{
    if(to.meta.requireAuth){
        if(getStore('token')){
            next();
        }else{
            next();
            // location.href="http://172.16.16.122:8080/security";
        }
    }else{
        next();
    }
});*/

export default router;
