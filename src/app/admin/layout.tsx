import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">KMI Services Admin</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="hover:underline">
                  Quote Form
                </Link>
              </li>
              <li>
                <Link href="/admin/quotes" className="hover:underline">
                  Quote Tracker
                </Link>
              </li>
              <li>
                <Link href="/admin/reports" className="hover:underline">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/admin/data-management" className="hover:underline">
                  Manage Data
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow p-4">
        {children}
      </main>
      
      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} KMI Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
