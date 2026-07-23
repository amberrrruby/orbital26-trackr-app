"use client";
import { User as DBUser } from "@/lib/generated/client";
import { editProfile, updateReminderSettings } from "@/app/actions/settings";
import { useState } from "react";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import styles from "../Settings.module.css";
import { ReminderSettings } from "@/lib/types";
import { useToast } from "@/app/components/Toast";

type Props = { userProfile: DBUser; userSettings: ReminderSettings };

export default function EditProfileForm({ userProfile, userSettings }: Props) {
  const { name } = userProfile;
  const snapshot = name;
  const { toast } = useToast();

  const [isDirty, setIsDirty] = useState(false);

  async function handleSubmitProfile(formData: FormData) {
    const result = await editProfile(formData);

    if (!result.ok) {
      const { error } = result;
      toast({
        title:
          error.type === "FAILURE" ? "Something went wrong" : "Invalid input",
        description:
          error.type === "FAILURE"
            ? "Please refresh and try again."
            : `${error.param}: ${error.message}`,
        variant: "danger",
      });
      return;
    }

    toast({ title: "Profile updated", variant: "success" });
    setIsDirty(false);
  }

  async function handleSubmitReminders(formData: FormData) {
    const result = await updateReminderSettings(formData);

    if (!result.ok) {
      const { error } = result;
      toast({
        title:
          error.type === "FAILURE" ? "Something went wrong" : "Invalid input",
        description:
          error.type === "FAILURE"
            ? "Please refresh and try again."
            : `${error.param}: ${error.message}`,
        variant: "danger",
      });
      return;
    }

    toast({ title: "Reminder settings updated", variant: "success" });
  }

  return (
    <>
      <form
        aria-label="Profile settings"
        action={handleSubmitProfile}
        className={styles.card}
      >
        <Input
          label="Display name"
          name="name"
          defaultValue={name ?? ""}
          placeholder="Enter a display name..."
          onChange={(e) => setIsDirty(e.target.value.trim() !== snapshot)}
        />

        <Button
          type="submit"
          disabled={!isDirty}
          variant="primary"
          className={styles.action}
        >
          Save changes
        </Button>
      </form>

      <form
        aria-label="Reminder settings"
        action={handleSubmitReminders}
        className={styles.card}
      >
        <div>
          <label htmlFor="eventReminderDays">
            Event reminder days (comma-separated)
          </label>
          <input
            id="eventReminderDays"
            name="eventReminderDays"
            type="text"
            defaultValue={userSettings.eventReminderDays.join(", ")}
            placeholder="1, 3, 7"
            required
          />
        </div>

        <div>
          <label htmlFor="appliedFollowUpDays">Applied follow-up days</label>
          <input
            id="appliedFollowUpDays"
            name="appliedFollowUpDays"
            type="number"
            min={0}
            step={1}
            defaultValue={userSettings.appliedFollowUpDays}
            required
          />
        </div>

        <div>
          <label htmlFor="assessmentFollowUpDays">
            Assessment follow-up days
          </label>
          <input
            id="assessmentFollowUpDays"
            name="assessmentFollowUpDays"
            type="number"
            min={0}
            step={1}
            defaultValue={userSettings.assessmentFollowUpDays}
            required
          />
        </div>

        <div>
          <label htmlFor="interviewFollowUpDays">
            Interview follow-up days
          </label>
          <input
            id="interviewFollowUpDays"
            name="interviewFollowUpDays"
            type="number"
            min={0}
            step={1}
            defaultValue={userSettings.interviewFollowUpDays}
            required
          />
        </div>

        <div className={styles.saveButton}>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </>
  );
}
