"use client";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-no-scroll h-full flex flex-col overflow-hidden -m-4 lg:-m-6 p-4 lg:p-6">
      {children}
    </div>
  );
}
