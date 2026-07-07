"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { User as DBUser } from "@/lib/generated/client";
import { useTheme } from "next-themes";
import { Tooltip } from "./Tooltip";
import Image from "next/image";
import {
  LuLayoutGrid,
  LuTable2,
  LuSquareKanban,
  LuChartNoAxesCombined,
  LuBell,
  LuFileText,
  LuSettings,
  LuSun,
  LuMoon,
  LuLogOut,
} from "react-icons/lu";

type Props = { children: React.ReactNode; user: DBUser };

// ─── Nav config ──────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const COLLAPSED_KEY = "sidebar:collapsed";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LuLayoutGrid /> },
  { label: "Table", href: "/applications", icon: <LuTable2 /> },
  { label: "Kanban", href: "/kanban", icon: <LuSquareKanban /> },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <LuChartNoAxesCombined />,
    disabled: true,
  },
  {
    label: "Reminders",
    href: "/reminders",
    icon: <LuBell />,
  },
  { label: "Resumes", href: "/resumes", icon: <LuFileText /> },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Sidebar({ children, user }: Props) {
  const pathname = usePathname();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }

  // Close popover on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const initials =
    user.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <div
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ""}`}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
      >
        {/* Top: Logo + collapse toggle */}
        <div className={styles.top}>
          <span className={styles.logo}>
            <Image
              src="/trackr-logo.png"
              alt="Trackr logo"
              width={20}
              height={20}
            />
            {!collapsed && <span className={styles.logoText}>Trackr</span>}
          </span>
          <button
            className={styles.collapseBtn}
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <IconCollapse collapsed={collapsed} />
          </button>
        </div>

        {/* Middle: Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            if (item.disabled) {
              return (
                <Tooltip
                  key={item.href}
                  content={collapsed ? item.label : "Coming soon"}
                  side="right"
                >
                  <span
                    className={`${styles.navItem} ${styles.navDisabled} ${collapsed ? styles.navItemCollapsed : ""}`}
                    aria-disabled="true"
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!collapsed && item.label}
                  </span>
                </Tooltip>
              );
            }

            return collapsed ? (
              <Tooltip key={item.href} content={item.label} side="right">
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${styles.navItemCollapsed} ${isActive ? styles.navActive : ""}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                </Link>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User row + popover */}
        <div className={styles.bottom}>
          <Tooltip
            content={collapsed ? (user?.name ?? "Account") : ""}
            side="right"
          >
            <button
              ref={triggerRef}
              className={`${styles.userRow} ${collapsed ? styles.userRowCollapsed : ""}`}
              onClick={() => setPopoverOpen((o) => !o)}
              aria-expanded={popoverOpen}
              aria-haspopup="true"
            >
              <span className={styles.avatar}>{initials}</span>
              {!collapsed && (
                <>
                  <span className={styles.userName}>
                    {user?.name ?? "Loading…"}
                  </span>
                  <span className={styles.chevron}>
                    <IconChevron />
                  </span>
                </>
              )}
            </button>
          </Tooltip>

          {popoverOpen && (
            <div ref={popoverRef} className={styles.popover} role="menu">
              {/* Header */}
              <div className={styles.popoverHeader}>
                <span className={styles.popoverName}>{user?.name}</span>
                <span className={styles.popoverEmail}>{user?.email}</span>
              </div>
              <div className={styles.popoverDivider} />

              {/* Settings */}
              <Link
                href="/settings"
                className={styles.popoverItem}
                role="menuitem"
                onClick={() => setPopoverOpen(false)}
              >
                <LuSettings /> Settings
              </Link>

              <div className={styles.popoverDivider} />

              {/* Theme toggle */}
              <button
                className={styles.popoverItem}
                role="menuitem"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                {resolvedTheme === "dark" ? <LuSun /> : <LuMoon />}
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </button>

              <div className={styles.popoverDivider} />

              {/* Logout */}
              <form action="/actions/auth/logout" method="post">
                <button
                  type="submit"
                  className={`${styles.popoverItem} ${styles.popoverLogout}`}
                  role="menuitem"
                >
                  <LuLogOut /> Log out
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}

// ─── Icons (inline SVG, no external dep) ─────────────────────────────────────

function IconCollapse({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        transform: collapsed ? "rotate(180deg)" : "none",
        transition: "transform 0.2s ease",
      }}
    >
      <path
        d="M9 2L5 7L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="6" fill="currentColor" opacity="0.15" />
      <path
        d="M6 16L11 6L16 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="9"
        y="1"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="1"
        y="9"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function IconTable() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M1 5H15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 5V15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconKanban() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="4"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="6"
        y="1"
        width="4"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11"
        y="1"
        width="4"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function IconAnalytics() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 13L6 8L9 11L13 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="5" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IconReminders() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 2.5.5 4 1 4.5H2.5C3 10 3.5 8.5 3.5 6A4.5 4.5 0 0 1 8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 10.5a1.5 1.5 0 0 0 3 0"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function IconResumes() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="3"
        y="1"
        width="10"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 5H10M6 8H10M6 11H8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5 6L7 4L9 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 12c0-2.5 2-4 5-4s5 1.5 5 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M11.5 2.5l-1 1M3.5 10.5l-1 1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M12 8.5A5.5 5.5 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M11.5 2.5l-1 1M3.5 10.5l-1 1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M9 2H11.5A1.5 1.5 0 0 1 13 3.5v7A1.5 1.5 0 0 1 11.5 12H9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6 9.5L9 7L6 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7H1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
