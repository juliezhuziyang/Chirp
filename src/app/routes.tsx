import { createBrowserRouter, Navigate } from "react-router";
import Home from "./pages/Home";
import About from "./pages/About";
import HowItWorksPage from "./pages/HowItWorksPage";
import DemoPage from "./pages/DemoPage";
import Newsletter from "./pages/Newsletter";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import SoundRecognitionPage from "./pages/dashboard/SoundRecognitionPage";
import MyBirdProfilePage from "./pages/dashboard/MyBirdProfilePage";
import CommunityPage from "./pages/dashboard/CommunityPage";
import FriendsPage from "./pages/dashboard/FriendsPage";
import ContributePage from "./pages/dashboard/ContributePage";

export const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/about", Component: About },
  { path: "/how-it-works", Component: HowItWorksPage },
  { path: "/demo", Component: DemoPage },
  { path: "/newsletter", Component: Newsletter },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "/onboarding", Component: Onboarding },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, element: <Navigate to="sound" replace /> },
      { path: "sound", Component: SoundRecognitionPage },
      { path: "my-bird", Component: MyBirdProfilePage },
      { path: "community", Component: CommunityPage },
      { path: "friends", Component: FriendsPage },
      { path: "contribute", Component: ContributePage },
    ],
  },
  { path: "/my-bird", element: <Navigate to="/dashboard/my-bird" replace /> },
]);
