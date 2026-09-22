import {
  Home as HomeIcon,
  Target,
  ShoppingBag,
  Wallet as WalletIcon,
  User,
} from "lucide-react";

import type { Tab } from "../App";

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabs = [
  {
    id: "home" as Tab,
    label: "Home",
    icon: HomeIcon,
  },
  {
    id: "tasks" as Tab,
    label: "Tasks",
    icon: Target,
  },
  {
    id: "market" as Tab,
    label: "Market",
    icon: ShoppingBag,
  },
  {
    id: "wallet" as Tab,
    label: "Wallet",
    icon: WalletIcon,
  },
  {
    id: "profile" as Tab,
    label: "Profile",
    icon: User,
  },
];

export default function BottomNav({
  activeTab,
  setActiveTab,
}: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`nav-item ${active ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon
              size={21}
              strokeWidth={active ? 2.5 : 2}
            />

            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}