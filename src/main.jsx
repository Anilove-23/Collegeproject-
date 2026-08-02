import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { AllocationRoutes } from "./room_allocation";
import WardenAllocationPage from "./room_allocation/pages/WardenAllocationPage";

/* ================= AUTH ================= */
import Login from "./auth/login";
import Signup from "./auth/signup";
import OtpVerification from "./auth/OtpVerification";

/* ================= FACE RECOGNITION ================= */
import EnrollFace from "./face_recognition/EnrollFace";
import VerifyFace from "./face_recognition/VerifyFace";

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

import GateLogs from "./guard/GateLogs";
import ChiefWardenAllocationPage from "./chief-warden/chief-warden";
import Warden from "./warden/warden";

/* ================= LOGS ================= */
import LogsPage from "./logs/LogsPage";

/* ================= ERROR PAGE ================= */
function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-3xl p-10 text-center max-w-md w-full border border-gray-200">
        <h1 className="text-6xl font-extrabold text-[#6d0f16]">404</h1>
        <p className="text-xl font-bold text-gray-800 mt-4">Page Not Found</p>
        <p className="text-gray-500 text-sm mt-2">
          The page you are trying to access does not exist or has moved.
        </p>
        <button
          onClick={() => (window.location.href = "/signin")}
          className="mt-6 bg-[#6d0f16] hover:bg-[#530b11] text-white font-semibold px-6 py-3 rounded-2xl transition shadow-sm cursor-pointer"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

// Check if AllocationRoutes is an array of objects or single route element
const parsedAllocationRoutes = Array.isArray(AllocationRoutes)
  ? AllocationRoutes
  : [AllocationRoutes];

/* ================= ROUTES ================= */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" replace />,
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
    path: "/verify-otp",
    element: <OtpVerification />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/face/enroll",
    element: <EnrollFace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/face/verify",
    element: <VerifyFace />,
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
        path: "logs",
        element: <GateLogs />,
      },
      
    ],
  },
  ...parsedAllocationRoutes,
  {
    path: "/warden",
    element: <Warden />,
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
    path: "/logs",
    element: <LogsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

/* ================= RENDER ================= */
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);