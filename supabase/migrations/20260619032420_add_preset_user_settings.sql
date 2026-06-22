/*
  Sets a default value for the `settings` column in `User`.
*/

ALTER TABLE public."User"
ALTER COLUMN "settings"
SET DEFAULT
'{
  "eventReminderDays": [3,1,0],
  "appliedFollowUpDays": 7,
  "assessmentFollowUpDays": 7,
  "interviewFollowUpDays": 7
}'::jsonb;