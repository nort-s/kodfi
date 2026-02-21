"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import { FileDigit, CircleDollarSign, Settings } from 'lucide-react';
import SidebarWidget from "./SidebarWidget";

import { useSession } from "next-auth/react";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  isRoot?: boolean;
  subPath?: string;
  subItems?: { name: string; icon?: React.ReactNode; path: string; pro?: boolean; new?: boolean }[];
};

const adminPrefix = "/admin";

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <FileDigit />,
    name: "Tickets",
    subPath: "/tickets",
    subItems: [
      { name: "Wifizone", path: "/hotspots", pro: false },
      { name: "Offres", path: "/offers", pro: false },
      { name: "Codes", path: "/codes", pro: false }
    ],
  },
  {
    icon: <CircleDollarSign />,
    name: "Finances",
    subPath: "/finances",
    subItems: [
      { name: "Clients", path: "/customers", pro: false },
      { name: "Ventes", path: "/sales", pro: false },
    ],
  },

  {
    icon: <CalenderIcon />,
    name: "Mon Compte",
    subPath: "/account",
    subItems: [
      { name: "Profil", path: "/profile" },
      { name: "Portefeuille", path: "/wallet" },
      { name: "Transactions", path: "/transactions", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Notifications",
    path: "/notifications",
  },
];

const superAdminItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard Global",
    path: "/root-dashboard",
  },
  {
    icon: <CircleDollarSign />,
    name: "Finances",
    subPath: "/root-dashboard",
    subItems: [
      { name: "Paiements", path: "/payouts", pro: false },
    //   { name: "Offres", path: "/offers", pro: false },
    //   { name: "Codes", path: "/codes", pro: false }
    ],
  },
  // {
  //   icon: <CircleDollarSign />,
  //   name: "Finances",
  //   subPath: "/finances",
  //   subItems: [
  //     { name: "Clients", path: "/customers", pro: false },
  //     { name: "Ventes", path: "/sales", pro: false },
  //   ],
  // },

  // {
  //   icon: <CalenderIcon />,
  //   name: "Mon Compte",
  //   subPath: "/account",
  //   subItems: [
  //     { name: "Profil", path: "/profile" },
  //     { name: "Portefeuille", path: "/wallet" },
  //     { name: "Transactions", path: "/transactions", pro: false },
  //   ],
  // },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Notifications",
  //   path: "/notifications",
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();


  const renderMenuItems = ( navItems: NavItem[], menuType: "main" | "superAdmin" ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={adminPrefix+nav.path}
                className={`menu-item group ${isActive(adminPrefix+nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(adminPrefix+nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={adminPrefix + nav.subPath + subItem.path}
                      className={`menu-dropdown-item ${isActive(adminPrefix+ nav.subPath + subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(adminPrefix + nav.subPath + subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(adminPrefix + nav.subPath + subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{type: "main" | "superAdmin"; index: number;} | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "superAdmin"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : superAdminItems;
      // const items = navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(adminPrefix + nav.subPath + subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "superAdmin",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "superAdmin") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <span className="text-2xl font-bold">KODFI</span>
        {/* <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link> */}
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {session?.user?.role === "ADMIN" && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Super Admin"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(superAdminItems, "superAdmin")}
              </div>
            )}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
