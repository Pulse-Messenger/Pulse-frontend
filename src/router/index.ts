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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: HomeView,
      redirect: { name: "Me" },
      name: "Main",
      children: [
        {
          path: "me",
          component: MeView,
          name: "Me",
          redirect: { name: "Friends" },
          children: [
            {
              path: "friends",
              component: FriendsView,
              name: "Friends",
            },
            {
              path: ":DMID",
              component: DMView,
              name: "DM",
            },
          ],
        },
        {
          path: "channels/:roomID",
          component: RoomView,
          name: "Room",
          children: [
            {
              path: ":channelID",
              component: ChannelView,
              name: "Channel",
            },
          ],
        },
        {
          path: "/settings",
          name: "Settings",
          component: SettingsView,
          children: [
            {
              path: "profile",
              name: "Profile",
              component: ProfileView,
            },
            {
              path: "appearance",
              name: "Appearance",
              component: AppearanceView,
            },
            {
              path: "sessions",
              name: "Sessions",
              component: SessionsView,
            },
            {
              path: "notifications",
              name: "Notifications",
              component: NotificationsView,
            },
          ],
        },
      ],
    },
    {
      path: "/signIn",
      name: "SignIn",
      component: SignInView,
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "Main" } },
  ],
});

export default router;
