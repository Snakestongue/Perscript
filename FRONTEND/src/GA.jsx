import {useEffect} from "react";
import { useLocation} from "react-router-dom";

function GA() {
  let location = useLocation();
useEffect(() => {
    if (typeof window.gtag !== "function"){
        return;
    }
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
    });
  }, [location]);

  return null
}

export default GA;