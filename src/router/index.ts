import { useAuthStore } from "@/stores/AuthStore";
import { createRouter, createWebHistory } from "vue-router";

const HomeView = () => import("@/views/Home/HomeView.vue");
const RoomView = () => import("@/views/Room/RoomView.vue");
const ChannelView = () => import("@/views/Room/ChannelView.vue");
const SignInView = () => import("@/views/SignInView.vue");
const SettingsView = () => import("@/views/Settings/SettingsView.vue");
const AppearanceView = () => import("@/views/Settings/AppearanceView.vue");
const ProfileView = () => import("@/views/Settings/ProfileView.vue");
const SessionsView = () => import("@/views/Settings/SessionsView.vue");
const FriendsView = () => import("@/views/Home/FriendsView.vue");
const MeView = () => import("@/views/Home/MeView.vue");
const DMView = () => import("@/views/Home/DMView.vue");
const NotificationsView = () =>
  import("@/views/Settings/NotificationsView.vue");
const LandingView = () => import("@/views/LandingView.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Landing",
      component: LandingView,
      meta: { requiresAuth: false },
    },
    {
      path: "/app",
      component: HomeView,
      redirect: { name: "Me" },
      name: "Main",
      meta: { requiresAuth: true },
      children: [
        {
          path: "me",
          component: MeView,
          name: "Me",
          redirect: { name: "Friends" },
          meta: { requiresAuth: true },
          children: [
            {
              path: "friends",
              component: FriendsView,
              name: "Friends",
              meta: { requiresAuth: true },
            },
            {
              path: ":DMID",
              component: DMView,
              name: "DM",
              meta: { requiresAuth: true },
            },
          ],
        },
        {
          path: "channels/:roomID",
          component: RoomView,
          name: "Room",
          meta: { requiresAuth: true },
          children: [
            {
              path: ":channelID",
              component: ChannelView,
              name: "Channel",
              meta: { requiresAuth: true },
            },
          ],
        },
        {
          path: "settings",
          name: "Settings",
          component: SettingsView,
          meta: { requiresAuth: true },

          children: [
            {
              path: "profile",
              name: "Profile",
              component: ProfileView,
              meta: { requiresAuth: true },
            },
            {
              path: "appearance",
              name: "Appearance",
              component: AppearanceView,
              meta: { requiresAuth: true },
            },
            {
              path: "sessions",
              name: "Sessions",
              component: SessionsView,
              meta: { requiresAuth: true },
            },
            {
              path: "notifications",
              name: "Notifications",
              component: NotificationsView,
              meta: { requiresAuth: true },
            },
          ],
        },
      ],
    },
    {
      path: "/signIn",
      name: "SignIn",
      component: SignInView,
      meta: { requiresAuth: false },
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "Main" } },
  ],
});

export default router;
