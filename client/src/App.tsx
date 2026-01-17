import { useState, useEffect } from 'react';
import { Route, Switch } from "wouter";
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { ShopProvider } from './contexts/ShopContext';
import { SalesHistoryProvider } from './contexts/SalesHistoryContext';
import { PriceHistoryProvider } from './contexts/PriceHistoryContext';
import { initializeDemoData } from './lib/demoData';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import NotFound from "@/pages/NotFound";

// Initialize demo data is now called in Router useEffect

function Router() {
  console.log("[Router] Router component rendering");
  
  // Safe localStorage access with try-catch
  let isLoggedIn = false;
  try {
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  } catch (error) {
    console.warn("[Router] Error accessing localStorage:", error);
  }
  
  const [loggedInState, setLoggedInState] = useState(isLoggedIn);

  // Initialize demo data and listen for storage changes
  useEffect(() => {
    console.log("[Router] Router useEffect running, isLoggedIn:", loggedInState);
    
    try {
      initializeDemoData();
    } catch (error) {
      console.error("[Router] Error initializing demo data:", error);
    }

    const handleStorageChange = () => {
      try {
        setLoggedInState(localStorage.getItem('isLoggedIn') === 'true');
      } catch (error) {
        console.warn("[Router] Error handling storage change:", error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loggedInState]);

  // Wrap Router in try-catch for safety
  try {
    return (
      <Switch>
        <Route path={"/"} component={loggedInState ? Home : LandingPage} />
        <Route path={"/login"} component={LoginPage} />
        <Route path={"/signup"} component={SignUpPage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  } catch (error) {
    console.error("[Router] Error rendering routes:", error);
    return (
      <div style={{ padding: '20px', color: 'red', backgroundColor: 'white' }}>
        <h1>Router Error</h1>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  console.log("[App] App component rendering");
  
  // App structure with all required providers
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <ShopProvider>
          <SalesHistoryProvider>
            <PriceHistoryProvider>
              <Router />
            </PriceHistoryProvider>
          </SalesHistoryProvider>
        </ShopProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
