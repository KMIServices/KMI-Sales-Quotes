import ReportingDashboard from '../../../components/ReportingDashboard';

export default function AdminReportsPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">KMI Services Admin</h1>
          <p className="text-gray-600">Financial Reports & Analytics</p>
        </header>
        
        <ReportingDashboard />
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} KMI Services. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
