import Dashboard from "views/Dashboard/Dashboard";
import Maps from "views/Maps/Maps";
import Go from "views/Go/Go"
import Notifications from "views/Notifications/Notifications";
import Test from "views/Test/Test"
import TestOffline from "views/TestOffline/TestOffline"
const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Go,
    shown:true
  }, 
  { 
    path: "/story",
    name: "Story", 
    icon: "pe-7s-paint-bucket",
    component: Maps,
    shown:true
  },
  { 
    path: "/maps",
    name: "openSenseMap", 
    icon: "pe-7s-map-marker",
    component: Maps,
    shown:true 
    },{
    path: "/go",
    name: "Go", 
    icon: "pe-7s-map-marker",
    component: Go ,
    shown:false
   },
   {
    path: "/senseBox",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard,
    shown:false
  }, 
  {
    path: "/test",
    name: "Test",
    icon: "pe-7s-graph",
    component: Test,
    shown:true
  }, 
  {
    path: "/testfloffline",
    name: "Test Offline",
    icon: "pe-7s-graph",
    component: TestOffline,
    shown:true
  }, 
  { redirect: true, path: "/", to: "/go", name: "Go",Component:Go }
];

export default dashboardRoutes;
