export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type AppAuthError = { type: "UNAUTHORIZED"; message: "Unauthorized" };

export type AppUnknownError = { type: "UNKNOWN"; message: string };

// Settings-related errors

// export type SettingsError =
//     | ChangePasswordError
//     | DeleteAccountError

export type ChangePasswordError = AppAuthError | AppUnknownError;

export type DeleteAccountError = AppAuthError | AppUnknownError;
