import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";

// Layouts / guards
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashIntro from "./components/SplashIntro";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/layout";

// Public pages
import Home from "./pages/home";
import ChiSiamo from "./pages/chi-siamo";
import Catalogo from "./pages/catalogo";
import Contatti from "./pages/contatti";

// Admin pages
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import ProdottiAdmin from "./pages/admin/prodotti";
import ProdottiForm from "./pages/admin/prodotti-form";
import CategorieAdmin from "./pages/admin/categorie";
import Stilizzatore from "./pages/admin/stilizzatore";
import CambiaPassword from "./pages/admin/password";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Provider>
      <SplashIntro />
      <ScrollToTop />
      <Switch>
        {/* Admin login — standalone */}
        <Route path="/admin/login" component={AdminLogin} />

        {/* Admin protected routes */}
        <Route path="/admin">
          {() => (
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin/stilizzatore">
          {() => (
            <ProtectedRoute>
              <Stilizzatore />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin/password">
          {() => (
            <ProtectedRoute>
              <CambiaPassword />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin/prodotti/nuovo">
          {() => (
            <ProtectedRoute>
              <ProdottiForm />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin/prodotti/:id">
          {(params) => (
            <ProtectedRoute>
              <ProdottiForm />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin/prodotti">
          {() => (
            <ProtectedRoute>
              <AdminLayout>
                <ProdottiAdmin />
              </AdminLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin/categorie">
          {() => (
            <ProtectedRoute>
              <AdminLayout>
                <CategorieAdmin />
              </AdminLayout>
            </ProtectedRoute>
          )}
        </Route>

        {/* Public routes */}
        <Route path="/chi-siamo">
          {() => (
            <PublicLayout>
              <ChiSiamo />
            </PublicLayout>
          )}
        </Route>
        <Route path="/catalogo">
          {() => (
            <PublicLayout>
              <Catalogo />
            </PublicLayout>
          )}
        </Route>
        <Route path="/contatti">
          {() => (
            <PublicLayout>
              <Contatti />
            </PublicLayout>
          )}
        </Route>
        <Route path="/">
          {() => (
            <PublicLayout>
              <Home />
            </PublicLayout>
          )}
        </Route>
      </Switch>

      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
