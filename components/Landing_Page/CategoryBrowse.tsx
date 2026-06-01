"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Category = {
  title: string;
  description: string;
  suppliers: string;
  products: string;
  image: string;
  alt: string;
  slug: string;
};

function getCategoryStats(code: string) {
  switch (code) {
    case 'plastic':
      return { suppliers: "1,140+ suppliers", products: "8,200+ products" };
    case 'metal':
      return { suppliers: "920+ suppliers", products: "6,500+ products" };
    case 'chemicals':
      return { suppliers: "840+ suppliers", products: "5,900+ products" };
    case 'construction':
      return { suppliers: "720+ suppliers", products: "4,800+ products" };
    case 'machinery':
      return { suppliers: "610+ suppliers", products: "4,200+ products" };
    case 'packaging':
      return { suppliers: "530+ suppliers", products: "3,800+ products" };
    case 'textiles':
      return { suppliers: "480+ suppliers", products: "3,400+ products" };
    case 'automotive':
      return { suppliers: "410+ suppliers", products: "2,900+ products" };
    case 'agriculture':
      return { suppliers: "390+ suppliers", products: "2,500+ products" };
    case 'electrical':
      return { suppliers: "350+ suppliers", products: "2,200+ products" };
    default:
      return { suppliers: "500+ suppliers", products: "3,500+ products" };
  }
}

export function CategoryBrowse() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"}/api/products/getCategories`
        );
        if (res.ok) {
          const resData = await res.json();
          if (resData.data) {
            const mapped = resData.data.map((c: any) => {
              const stats = getCategoryStats(c.code);
              return {
                title: c.label,
                description: c.description || "",
                suppliers: stats.suppliers,
                products: stats.products,
                image: c.image || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=80",
                alt: c.label,
                slug: c.code,
              };
            });
            setCategories(mapped.slice(0, 2));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section id="categories" className="border-t border-zinc-200 bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1d4ed8] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Browse by Category</h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Explore supplier depth across core industrial categories
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-semibold text-[#1d4ed8] hover:text-[#1e40af] transition-colors"
          >
            View All Categories &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {categories.map((category) => (
            <article
              key={category.title}
              className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-64 w-full bg-zinc-100 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-zinc-900">{category.title}</h3>
                <p className="text-sm text-zinc-600">{category.description}</p>
                <div className="flex gap-4 text-xs text-zinc-500 py-2 border-t border-zinc-100">
                  <span>{category.suppliers}</span>
                  <span>•</span>
                  <span>{category.products}</span>
                </div>
                <Link
                  href={`/products/${category.slug}`}
                  className="inline-block mt-1 rounded-lg bg-[#1d4ed8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1e40af] transition-colors"
                >
                  Explore {category.title}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

