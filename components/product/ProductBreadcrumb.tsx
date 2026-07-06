"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui";
import { useCartStore } from "@/store/cartStore";

interface ProductBreadcrumbProps {
  productName: string;
}

export function ProductBreadcrumb({ productName }: ProductBreadcrumbProps) {
  const totalItems = useCartStore((s) => s.items.length);

  return (
    <div className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: productName },
            ]}
          />
          {totalItems > 0 && (
            <Link
              href="/cart"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ShoppingCart size={16} />
              <span>{totalItems} items in cart</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
