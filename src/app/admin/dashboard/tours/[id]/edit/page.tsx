import EditTourPageContent from './EditTourPageContent';

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditTourPageContent tourId={id} />;
}
