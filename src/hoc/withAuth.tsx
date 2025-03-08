"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }, [router]);
    return <Component {...props} />;
  };

  // Thêm displayName cho component
  const componentName = Component.displayName || Component.name || "Component";
  WithAuthComponent.displayName = `WithAuth(${componentName})`;

  return WithAuthComponent;
}
