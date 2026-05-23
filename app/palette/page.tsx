"use client";
import { useTheme } from "next-themes";
import { Button } from "../components/Button";
import { Input, Textarea } from "../components/Input";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { useState } from "react";
import { useToast } from "../components/Toast";

export default function PalettePage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "56px",
      }}
    >
      {/* Theme toggle */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Button
          size="sm"
          role="menuitem"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>
      {/* ── Typography ── */}
      <section>
        <SectionTitle>Typography</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            {
              label: "3xl / 36px",
              size: "var(--text-3xl)",
              weight: "var(--weight-bold)",
            },
            {
              label: "2xl / 28px",
              size: "var(--text-2xl)",
              weight: "var(--weight-semi)",
            },
            {
              label: "xl / 22px",
              size: "var(--text-xl)",
              weight: "var(--weight-semi)",
            },
            {
              label: "lg / 18px",
              size: "var(--text-lg)",
              weight: "var(--weight-medium)",
            },
            {
              label: "md / 15px",
              size: "var(--text-md)",
              weight: "var(--weight-normal)",
            },
            {
              label: "base / 13.5px",
              size: "var(--text-base)",
              weight: "var(--weight-normal)",
            },
            {
              label: "sm / 12.5px",
              size: "var(--text-sm)",
              weight: "var(--weight-normal)",
            },
            {
              label: "xs / 11px",
              size: "var(--text-xs)",
              weight: "var(--weight-normal)",
            },
          ].map(({ label, size, weight }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "baseline", gap: "16px" }}
            >
              <span
                style={{ fontSize: size, fontWeight: weight, lineHeight: 1.25 }}
              >
                Qwertyuiop Asdfghjkl, zxcvbnm.
              </span>
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
          <div style={{ marginTop: "8px" }}>
            <code>Monospace via DM Mono</code>
          </div>
        </div>
      </section>

      {/* ── Colors ── */}
      <section>
        <SectionTitle>Colors</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <SwatchRow
            label="Surface"
            swatches={[
              { name: "bg-base", var: "--color-bg-base" },
              { name: "bg-raised", var: "--color-bg-raised" },
              { name: "bg-overlay", var: "--color-bg-overlay" },
              { name: "bg-subtle", var: "--color-bg-subtle" },
              { name: "bg-inset", var: "--color-bg-inset" },
            ]}
          />

          <SwatchRow
            label="Text"
            swatches={[
              { name: "primary", var: "--color-text-primary" },
              { name: "secondary", var: "--color-text-secondary" },
              { name: "tertiary", var: "--color-text-tertiary" },
              { name: "disabled", var: "--color-text-disabled" },
            ]}
          />

          <SwatchRow
            label="Accent"
            swatches={[
              { name: "accent", var: "--color-accent" },
              { name: "accent-hover", var: "--color-accent-hover" },
              { name: "accent-subtle", var: "--color-accent-subtle" },
            ]}
          />

          <SwatchRow
            label="Semantic"
            swatches={[
              { name: "success", var: "--color-success" },
              { name: "success-subtle", var: "--color-success-subtle" },
              { name: "warning", var: "--color-warning" },
              { name: "warning-subtle", var: "--color-warning-subtle" },
              { name: "danger", var: "--color-danger" },
              { name: "danger-subtle", var: "--color-danger-subtle" },
              { name: "info", var: "--color-info" },
              { name: "info-subtle", var: "--color-info-subtle" },
            ]}
          />

          <SwatchRow
            label="Border"
            swatches={[
              { name: "border", var: "--color-border" },
              { name: "border-strong", var: "--color-border-strong" },
            ]}
          />
        </div>
      </section>

      {/* ── Spacing ── */}
      <section>
        <SectionTitle>Spacing</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((n) => (
            <div
              key={n}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                  width: "60px",
                }}
              >
                space-{n}
              </span>
              <div
                style={{
                  width: `var(--space-${n})`,
                  height: "10px",
                  background: "var(--color-accent)",
                  borderRadius: "2px",
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Border Radius ── */}
      <section>
        <SectionTitle>Border Radius</SectionTitle>
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          {[
            { label: "xs", var: "var(--radius-xs)" },
            { label: "sm", var: "var(--radius-sm)" },
            { label: "md", var: "var(--radius-md)" },
            { label: "lg", var: "var(--radius-lg)" },
            { label: "xl", var: "var(--radius-xl)" },
            { label: "full", var: "var(--radius-full)" },
          ].map(({ label, var: r }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-accent-subtle)",
                  border: "1px solid var(--color-accent-border)",
                  borderRadius: r,
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shadows ── */}
      <section>
        <SectionTitle>Shadows</SectionTitle>
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          {["xs", "sm", "md", "lg", "xl"].map((level) => (
            <div
              key={level}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  background: "var(--color-bg-raised)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: `var(--shadow-${level})`,
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                shadow-{level}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interactive Elements ── */}
      <section>
        <SectionTitle>Interactive Elements</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Field label="Buttons">
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button>Default button</button>
              <button disabled>Disabled</button>
            </div>
          </Field>

          <Field label="Links">
            <div style={{ display: "flex", gap: "16px" }}>
              <a href="#">Anchor link</a>
              <a href="#" style={{ color: "var(--color-text-primary)" }}>
                Neutral link
              </a>
            </div>
          </Field>

          <Field label="Text input">
            <input
              type="text"
              placeholder="Placeholder text"
              style={{ maxWidth: "320px" }}
            />
          </Field>

          <Field label="Focused input (click to see)">
            <input
              type="text"
              defaultValue="Focused state"
              style={{ maxWidth: "320px" }}
            />
          </Field>

          <Field label="Disabled input">
            <input
              type="text"
              disabled
              placeholder="Disabled"
              style={{ maxWidth: "320px" }}
            />
          </Field>

          <Field label="Textarea">
            <textarea
              placeholder="Multiline input..."
              style={{ maxWidth: "320px" }}
            />
          </Field>

          <Field label="Select">
            <select style={{ maxWidth: "320px" }}>
              <option>Option one</option>
              <option>Option two</option>
              <option>Option three</option>
            </select>
          </Field>

          <Field label="Checkbox & Radio">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input type="checkbox" defaultChecked /> Checked
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input type="checkbox" /> Unchecked
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input type="checkbox" disabled /> Disabled
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input type="radio" name="radio-demo" defaultChecked /> Option A
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input type="radio" name="radio-demo" /> Option B
              </label>
            </div>
          </Field>

          <Field label="Code & Pre">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <p>
                Inline <code>code snippet</code> inside text.
              </p>
              <pre>{`const greeting = "hello world";\nconsole.log(greeting);`}</pre>
            </div>
          </Field>

          <Field label="Table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Row one</td>
                  <td>Active</td>
                  <td>2025-01-01</td>
                </tr>
                <tr>
                  <td>Row two</td>
                  <td>Pending</td>
                  <td>2025-01-02</td>
                </tr>
                <tr>
                  <td>Row three</td>
                  <td>Closed</td>
                  <td>2025-01-03</td>
                </tr>
              </tbody>
            </table>
          </Field>

          <Field label="Horizontal Rule">
            <hr />
          </Field>

          <Field label="Buttons — variants">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </Field>
          <Field label="Buttons — sizes">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </Field>
          <Field label="Buttons — states">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Field>

          <Field label="Input — states">
            <Input
              label="Default"
              placeholder="Enter value"
              style={{ maxWidth: "320px" }}
            />
            <Input
              label="With helper"
              placeholder="Enter email"
              helper="We'll never share your email."
              style={{ maxWidth: "320px" }}
            />
            <Input
              label="With error"
              placeholder="Enter value"
              error="This field is required."
              style={{ maxWidth: "320px" }}
            />
            <Input
              label="Required"
              placeholder="Enter value"
              required
              style={{ maxWidth: "320px" }}
            />
            <Input
              label="Disabled"
              placeholder="Disabled"
              disabled
              style={{ maxWidth: "320px" }}
            />
          </Field>
          <Field label="Textarea — states">
            <Textarea
              label="Default"
              placeholder="Write something..."
              style={{ maxWidth: "320px" }}
            />
            <Textarea
              label="With error"
              placeholder="Write something..."
              error="Cannot be empty."
              style={{ maxWidth: "320px" }}
            />
          </Field>

          <Field label="Badges">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="accent">Accent</Badge>
            </div>
          </Field>

          <Button onClick={() => setOpen(true)}>Open modal</Button>

          <Modal
            open={open}
            onOpenChange={setOpen}
            title="Confirm deletion"
            description="This action cannot be undone."
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger">Delete</Button>
              </>
            }
          >
            <p>Are you sure you want to delete this item?</p>
          </Modal>

          <Button
            size="md"
            onClick={() => toast({ title: "Saved", variant: "success" })}
          >
            Success toast button
          </Button>
          <Button
            size="md"
            onClick={() =>
              toast({
                title: "Something went wrong",
                description: "Please try again.",
                variant: "danger",
              })
            }
          >
            Danger toast button
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ── Local helpers ─────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semi)",
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "20px",
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </h2>
  );
}

function SwatchRow({
  label,
  swatches,
}: {
  label: string;
  swatches: { name: string; var: string }[];
}) {
  return (
    <div>
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {swatches.map((s) => (
          <div
            key={s.var}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "var(--radius-md)",
                background: `var(${s.var})`,
                border: "1px solid var(--color-border)",
              }}
            />
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-mono)",
                textAlign: "center",
                maxWidth: "64px",
                wordBreak: "break-all",
              }}
            >
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
