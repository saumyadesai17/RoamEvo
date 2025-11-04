export const metadata = {
  title: 'Roamevo Admin Panel',
  description: 'Manage your travel tours and content',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {children}
    </div>
  );
}
