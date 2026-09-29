import HireConversation from "@/components/hiring/HireConversation";

export default async function WorkerHireChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HireConversation requestId={id} />;
}
