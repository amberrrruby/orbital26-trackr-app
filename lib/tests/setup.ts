import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("@/app/actions/applications", () => ({}));
vi.mock("@/app/actions/reminders", () => ({}));
vi.mock("@/app/actions/resume", () => ({}));
vi.mock("@/app/actions/settings", () => ({}));
vi.mock("@/app/actions/timeline", () => ({}));
