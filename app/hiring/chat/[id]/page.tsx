import HireConversation from "@/components/hiring/HireConversation";

export default async function ClientHireChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HireConversation requestId={id} />;
}
