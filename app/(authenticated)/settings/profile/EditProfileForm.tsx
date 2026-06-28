"use client";
import { User as DBUser } from "@/lib/generated/client";
import { editProfile, updateReminderSettings } from "@/app/actions/settings";
import { useState } from "react";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import styles from "../Settings.module.css";
import { ReminderSettings } from "@/lib/types";

type Props = { userProfile: DBUser; userSettings: ReminderSettings };

export default function EditProfileForm({ userProfile, userSettings }: Props) {
  const { name } = userProfile;

  const snapshot = name;

  const [isDirty, setIsDirty] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleSubmitProfile(formData: FormData) {
    setErrMsg(null);
    const result = await editProfile(formData);

    if (!result.ok) {
      const { error } = result;
      if (error.type === "FAILURE") {
        setErrMsg("Something went wrong, please refresh and try again.");
        return;
      }
      setErrMsg(`${error.param}: ${error.message}`);
    }
  }

  async function handleSubmitReminders(formData: FormData) {
    setErrMsg(null);
    const result = await updateReminderSettings(formData);

    if (!result.ok) {
      const { error } = result;
      if (error.type === "FAILURE") {
        setErrMsg("Something went wrong, please refresh and try again.");
        return;
      }
      setErrMsg(`${error.param}: ${error.message}`);
    }
  }

  return (
    <>
      <form action={handleSubmitProfile} className={styles.card}>
        {errMsg && <div>{errMsg}</div>}

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

      <form action={handleSubmitReminders} className={styles.card}>
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
