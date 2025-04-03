import QuoteForm from '../components/QuoteForm';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">KMI Services</h1>
          <p className="text-gray-600">Cleaning Service Quote Generator</p>
        </header>
        
        <QuoteForm />
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} KMI Services. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
