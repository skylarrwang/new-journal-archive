
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="avant-heading mb-4">404</h1>
        <p className="avant-subheading text-avant-medium-gray mb-8">Page Not Found</p>
        <a href="/" className="avant-btn inline-block">
          Return to Archive
        </a>
      </div>
    </div>
  );
};

export default NotFound;
