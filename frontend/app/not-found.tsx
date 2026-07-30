import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">The page you are looking for does not exist or has moved.</p>
        <Button className="mt-6" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}

