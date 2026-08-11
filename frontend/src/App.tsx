import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">UMU Sports</h1>
              <p className="text-gray-500 mt-1">University Sports & Student-Athlete Management System</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
