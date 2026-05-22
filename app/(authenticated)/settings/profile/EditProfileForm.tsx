"use client";
import { User as DBUser } from "@/lib/generated/client";
import { editProfileAction } from "@/app/actions/settings/edit-profile";
import { useState } from "react";

type Props = { userProfile: DBUser };

export default function EditProfileForm({ userProfile }: Props) {
  const { name } = userProfile;

  // someName -> someNam -> someName would make this `true`.
  // More of a UI / frontend issue to fix in a polish run.
  const [isDirty, setIsDirty] = useState(false);
  return (
    <form action={editProfileAction}>
      <label>Display name</label>
      <input
        name="name"
        defaultValue={name ?? ""}
        onChange={() => setIsDirty(true)}
      />

      <button type="submit" disabled={!isDirty}>
        Save changes
      </button>
    </form>
  );
}
