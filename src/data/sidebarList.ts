import type { SidebarItems } from "../models/SidebarItems";
import { IoHomeOutline } from "react-icons/io5";

export const sidebarList: SidebarItems[] = [
  {
    id: 1,
    path: "/dashboard",
    icon: IoHomeOutline,
    label: "Home",
  },
];