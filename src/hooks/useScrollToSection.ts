import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useScrollToSection() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on route change (unless there's a hash)
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  useEffect(() => {
    // Handle hash navigation after page load
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  const scrollToSection = (sectionId: string) => {
    // If we're on the homepage, scroll directly
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home with hash
      navigate(`/#${sectionId}`);
    }
  };

  return { scrollToSection };
}
