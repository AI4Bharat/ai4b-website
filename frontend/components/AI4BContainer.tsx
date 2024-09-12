"use client";

import PropTypes from "prop-types";
import { ReactNode } from "react";
import styles from "../src/app/AI4BContainer.module.css"; // Import custom CSS for responsive container
// Removed incorrect import

interface AI4BContainerProps {
  children: ReactNode;
  title?: string;
  p?: number;
  bgColor?: string;
  color?: string;
}

export default function AI4BContainer({
  children,
  p = 6, 
  bgColor = "#fff", 
  color = "#000", 
}: AI4BContainerProps) {
  return (
    <div
      className={styles.container}
      style={{
        padding: p,
        backgroundColor: bgColor,
        color: color,
      }}
    >
      {children}
    </div>
  );
}

// Define PropTypes for validation
AI4BContainer.propTypes = {
  children: PropTypes.node.isRequired,
  p: PropTypes.number,
  bgColor: PropTypes.string,
  color: PropTypes.string,
};
