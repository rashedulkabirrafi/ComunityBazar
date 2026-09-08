import Info from "../pages/Info";
import { createBrowserRouter } from "react-router";
import RootLayout from "../root/RootLayout";
import Home from "../pages/Home";
import Error from "../pages/Error";
import AddListing from "../pages/AddListing";
import MyOrders from "../pages/MyOrders";
import MyProfile from "../pages/MyProfile";
import MyCart from "../pages/MyCart";
import Marketplace from "../pages/Marketplace";
import ViewDetails from "../pages/ViewDetails";
import SellerProfile from "../pages/SellerProfile";
import Login from "../pages/Login";
import Regisger from "../pages/Register";
import AllUsers from "../pages/AllUsers";
import PrivateRoutes from "./PrivateRoutes";
import MyListing from "../components/MyListing";
import DashboardLayout from "../pages/DashboardLayout";
import MyWishlist from "../pages/MyWishlist";
import AllOrders from "../pages/AllOrders";
import AllProducts from "../pages/AllProducts";
import AdminRoutes from "./AdminRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout></RootLayout>,
    errorElement: <Error></Error>,
    children: [
      { path: "about", element: <Info /> },
      { path: "safety", element: <Info type="safety" /> },
      { path: "privacy", element: <Info type="privacy" /> },
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "Marketplace",
        element: <Marketplace></Marketplace>,
      },
      {
        path: "ViewDetails/:id",
        element: <ViewDetails />,
      },
      {
        path: "seller/:id",
        element: <SellerProfile />,
      },
      {
        path: "Login",
        element: <Login></Login>,
      },
      {
        path: "Register",
        element: <Regisger></Regisger>,
      },
      {
        path: "dashboard",
        element: (
          <PrivateRoutes>
            <DashboardLayout></DashboardLayout>
          </PrivateRoutes>
        ),
        children: [
          {
            path: "",
            element: <MyProfile></MyProfile>,
          },
          {
            path: "AddListing",
            element: <AddListing></AddListing>,
          },
          {
            path: "MyOrders",
            element: <MyOrders></MyOrders>,
          },
          {
            path: "MyProfile",
            element: <MyProfile></MyProfile>,
          },
          {
            path: "MyCart",
            element: <MyCart></MyCart>,
          },
          {
            path: "MyListing",
            element: <MyListing></MyListing>,
          },
          {
            path: "MyWishlist",
            element: <MyWishlist></MyWishlist>,
          },
          {
            path: "AllUsers",
            element: (
              <AdminRoutes>
                <AllUsers></AllUsers>
              </AdminRoutes>
            ),
          },
          {
            path: "AllOrders",
            element: (
              <AdminRoutes>
                <AllOrders></AllOrders>
              </AdminRoutes>
            ),
          },
          {
            path: "AllProducts",
            element: (
              <AdminRoutes>
                <AllProducts></AllProducts>
              </AdminRoutes>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
