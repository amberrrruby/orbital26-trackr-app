"use client";
import styles from "./GoogleButton.module.css";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton() {
  return (
    <div className={styles.button}>
      <FcGoogle size={20} />
      <span>Continue with Google</span>
    </div>
  );
}
