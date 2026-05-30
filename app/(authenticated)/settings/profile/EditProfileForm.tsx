"use client";
import { User as DBUser } from "@/lib/generated/client";
import { editProfile } from "@/app/actions/settings";
import { useState } from "react";

type Props = { userProfile: DBUser };

export default function EditProfileForm({ userProfile }: Props) {
  const { name } = userProfile;

  // someName -> someNam -> someName would make this `true`.
  // More of a UI / frontend issue to fix in a polish run.
  const [isDirty, setIsDirty] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
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

  return (
    <form action={handleSubmit}>
      {errMsg && <div>{errMsg}</div>}

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
