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

type Props = {
  children: React.ReactNode;
  user: DBUser;
  defaultCollapsed?: boolean;
};

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
  { label: "Analytics", href: "/analytics", icon: <LuChartNoAxesCombined /> },
  { label: "Reminders", href: "/reminders", icon: <LuBell /> },
  { label: "Resumes", href: "/resumes", icon: <LuFileText /> },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Sidebar({
  children,
  user,
  defaultCollapsed = false,
}: Props) {
  const pathname = usePathname();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      document.cookie = `${COLLAPSED_KEY}=${next}; path=/; max-age=31536000`;
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
