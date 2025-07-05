import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import ItemDetail from './pages/ItemDetail';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="item/:id" element={<ItemDetail />} />
            <Route path="movies" element={<div className="container mx-auto p-4">Movies Page</div>} />
            <Route path="shows" element={<div className="container mx-auto p-4">TV Shows Page</div>} />
            <Route path="music" element={<div className="container mx-auto p-4">Music Page</div>} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
