import { AlertTriangle } from "lucide-react";

type Props = { errorMsg: string; icon: React.ReactNode };

export default function ErrorDisplay({
  errorMsg = "Something went wrong. Please reload the page.",
  icon = <AlertTriangle />,
}: Props) {
  return (
    <>
      {icon}
      <p>{errorMsg}</p>
    </>
  );
}
