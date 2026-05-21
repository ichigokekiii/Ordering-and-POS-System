import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Petal Express` : "Petal Express";

    return () => {
      document.title = "Petal Express";
    };
  }, [title]);
}
