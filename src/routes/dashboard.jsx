import Dashboard from "views/Dashboard/Dashboard";
import Go from "views/Go/Go"
import Live from "views/Live/Live"
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
    component: Dashboard,
    shown:false
  },
 {
    path: "/go",
    name: "Go", 
    icon: "pe-7s-map-marker",
    component: Go ,
    shown:false
   },
   {
    path: "/senseBox/:id",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard,
    shown:false
  }, 
  {
    path: "/live",
    name: "Live",
    icon: "pe-7s-timer",
    component: Live,
    shown:true
  }, 
  { redirect: true, path: "/", to: "/go", name: "Go",Component:Go }
];

export default dashboardRoutes;
