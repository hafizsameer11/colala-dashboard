import images from "./images";

export const Sidebar_links = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: images.dashboard,
    sublinks: [],
    permission: "dashboard.view", // Required permission to view this menu item
  },
];
