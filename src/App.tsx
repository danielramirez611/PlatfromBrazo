import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Headers';
import LoginPage from './pages/Auth/LoginPage';
import MallaPage from './components/Malla';
import Banner from './components/Banner';
import PrivateRoute, { AdminRoute } from './components/PrivateRoute';
import TabletDetailsPage from './components/TabletDetailsPage';
import NotFoundPage from './components/NotFoundPage';
import AccountPage from './components/AccountPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/Auth/RegisterPage';
import { AuthProvider, useAuth } from './pages/Auth/AuthContext';
import ResponsiveAppBar from './components/NavBar';
import CoursesPage from './pages/Courses/CoursesPage';
import CourseDetail from './components/CourseDetails';
import ArduinoLab from './components/ArduinoLab';
import ArduinoTable from './components/ArduinoTable';
import EvoCalendar from './components/EvoCalendar';
import moment from 'moment';
import 'moment/locale/es';
import EntregasTabletPage from './components/EntregasTabletPage';

moment.locale('es'); // Establece el idioma español como predeterminado

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh' }}>
          <ResponsiveAppBar />
          <Header
            handleLogout={() => {
              const { logout } = useAuth();
              logout();
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entregas-tablet"
              element={
                <AdminRoute>
                  <EntregasTabletPage />
                </AdminRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/malla"
              element={
                <ProtectedRoute>
                  <MallaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:id"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            {/* Componente RemoteLabPage removido */}
            <Route
              path="/course-tablet"
              element={
                <AdminRoute>
                  <TabletDetailsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/arduino-lab"
              element={
                <ProtectedRoute>
                  <ArduinoLab />
                </ProtectedRoute>
              }
            />
            {/* Componente CodigoLab removido */}
            <Route
              path="/register"
              element={
                <AdminRoute>
                  <RegisterPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
            <Route
              path="/arduino-tablet"
              element={
                <AdminRoute>
                  <ArduinoTable />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      {isAuthenticated && user && (
        <div
          style={{
            backgroundColor: '#1E2123',
            padding: '20px',
            color: '#ffffff',
            zIndex: 1,
            position: 'relative',
          }}
        >
          <h2>
            Hola {user.first_name} {user.last_name}! Un gusto verte de nuevo!
          </h2>
        </div>
      )}

      <main style={{ flex: 1 }}>
        <Banner
          imageUrl="/img/banner.jpg"/>     
        <EvoCalendar />
      </main>
    </>
  );

};

export default App;
