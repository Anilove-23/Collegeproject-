import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  createRoutesFromElements,
} from "react-router-dom";
import "./index.css";

import { AllocationRoutes } from "./room_allocation";
import WardenAllocationPage from "./room_allocation/pages/WardenAllocationPage";

/* ================= AUTH ================= */
import Login from "./auth/login";
import Signup from "./auth/signup";

/* ================= STUDENT ================= */
import OutpassLayout from "./student/outpasses";

/* ================= COMPLAINT ================= */
import Complaint from "./complaint/complaint";
import ComplaintForm from "./complaint/ComplaintForm";

/* ================= ATTENDANT ================= */
import AdminLayout from "./attendant/AdminLayout";
import PendingPage from "./attendant/PendingPage";
import ApprovedPage from "./attendant/ApprovedPage";
import RejectedPage from "./attendant/RejectedPage";
import ComplaintsPage from "./attendant/ComplaintsPage";
import Admin from "./admin/admin";

/* ================= GUARD ================= */
import GuardLayout from "./guard/GuardLayout";
import Dashboard from "./guard/Dashboard";
import ExitPage from "./guard/ExitPage";
import ReturnPage from "./guard/ReturnPage";


import ChiefWardenAllocationPage from "./chief-warden/chief-warden";
import Warden from "./warden/warden";
/* ================= ERROR PAGE ================= */
function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-3xl p-10 text-center max-w-md w-full border">
        <h1 className="text-6xl font-bold text-[#6d0f16]">404</h1>
        <p className="text-xl font-semibold mt-4">Page Not Found</p>
        <p className="text-gray-500 mt-2">
          The page you are trying to access does not exist.
        </p>
        <button
          onClick={() => (window.location.href = "/signin")}
          className="mt-6 bg-[#6d0f16] hover:bg-[#530b11] text-white px-6 py-3 rounded-2xl transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

/* ================= ROUTES ================= */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" />,
  },
  {
    path: "/signin",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup",
    element: <Signup />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/student",
    element: <OutpassLayout />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/complaint",
    element: <Complaint />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/complaint-form",
    element: <ComplaintForm />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: <Admin />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/attendant",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/attendant/pending" replace />,
      },
      {
        path: "pending",
        element: <PendingPage />,
      },
      {
        path: "approved",
        element: <ApprovedPage />,
      },
      {
        path: "rejected",
        element: <RejectedPage />,
      },
      {
        path: "complaints",
        element: <ComplaintsPage />,
      },
    ],
  },
  {
    path: "/guard",
    element: <GuardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/guard/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "exit",
        element: <ExitPage />,
      },
      {
        path: "return",
        element: <ReturnPage />,
      },
    ],
  },
  ...createRoutesFromElements(<>{AllocationRoutes}</>),
  {
    path: "/warden",
    element: <WardenAllocationPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/chief-warden",
    element: <ChiefWardenAllocationPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/wardenhostel",
    element: <Warden />,
    errorElement: <ErrorPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

/* ================= RENDER ================= */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
