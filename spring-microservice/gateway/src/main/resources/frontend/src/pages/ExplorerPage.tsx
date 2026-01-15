export default function ExplorerPage() {
  return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="w-full h-40 bg-slate-100 rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert {i}</h3>
                <p className="text-gray-600 text-sm">
                  Découvrez les meilleurs experts dans différents domaines
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
