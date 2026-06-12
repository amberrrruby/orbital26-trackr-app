type ReminderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReminderDetailPage({
  params,
}: ReminderDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Reminder details</h1>
      <p>Reminder ID: {id}</p>
    </main>
  );
}
