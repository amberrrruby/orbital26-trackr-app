"use client";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  return (
    <form action="/actions/auth/logout" method="post">
      <button type="submit" className={styles.logoutButton}>
        Log out
      </button>
    </form>
  );
}
