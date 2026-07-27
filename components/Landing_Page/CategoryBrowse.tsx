"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Category = {
  title: string;
  description: string;
  suppliers: string;
  subText: string;
  image: string;
  alt: string;
  slug: string;
};

function getCategoryStats(code: string) {
  switch (code) {
    case "plastic":
      return { suppliers: "1,140+ suppliers", products: "8,200+ products" };
    case "metal":
      return { suppliers: "920+ suppliers", products: "6,500+ products" };
    case "chemicals":
      return { suppliers: "840+ suppliers", products: "5,900+ products" };
    case "construction":
      return { suppliers: "720+ suppliers", products: "4,800+ products" };
    case "machinery":
      return { suppliers: "610+ suppliers", products: "4,200+ products" };
    case "packaging":
      return { suppliers: "530+ suppliers", products: "3,800+ products" };
    case "textiles":
      return { suppliers: "480+ suppliers", products: "3,400+ products" };
    case "automotive":
      return { suppliers: "410+ suppliers", products: "2,900+ products" };
    case "agriculture":
      return { suppliers: "390+ suppliers", products: "2,500+ products" };
    case "electrical":
      return { suppliers: "350+ suppliers", products: "2,200+ products" };
    default:
      return { suppliers: "500+ suppliers", products: "3,500+ products" };
  }
}

function getServiceCategoryStats(code: string) {
  switch (code) {
    case "it_software_development":
      return { suppliers: "120+ providers", listings: "SaaS & Web Dev" };
    case "engineering_consulting":
      return { suppliers: "80+ consultants", listings: "CAD/CAM & Design" };
    case "manufacturing_contract_work":
      return { suppliers: "240+ workshops", listings: "Fabrication & OEM" };
    case "logistics_freight_transport":
      return { suppliers: "310+ carriers", listings: "Freight & Storage" };
    case "maintenance_repair_operations":
      return { suppliers: "190+ partners", listings: "AMC & Servicing" };
    case "civil_construction_services":
      return { suppliers: "150+ teams", listings: "Civil & Interiors" };
    default:
      return { suppliers: "60+ experts", listings: "Verified Services" };
  }
}

export function CategoryBrowse() {
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
        
        // Fetch both product and service categories concurrently
        const [prodRes, servRes] = await Promise.all([
          fetch(`${baseUrl}/api/products/getCategories?type=product`),
          fetch(`${baseUrl}/api/products/getCategories?type=service`),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.data) {
            const mapped = prodData.data.map((c: any) => {
              const stats = getCategoryStats(c.code);
              return {
                title: c.label,
                description: c.description || "",
                suppliers: stats.suppliers,
                subText: stats.products,
                image: c.image || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=80",
                alt: c.label,
                slug: c.code,
              };
            });
            setProductCategories(mapped.slice(0, 10));
          }
        }

        if (servRes.ok) {
          const servData = await servRes.json();
          if (servData.data) {
            const mapped = servData.data.map((c: any) => {
              const stats = getServiceCategoryStats(c.code);
              return {
                title: c.label,
                description: c.description || "",
                suppliers: stats.suppliers,
                subText: stats.listings,
                image: c.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
                alt: c.label,
                slug: c.id,
              };
            });
            setServiceCategories(mapped.slice(0, 10));
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

  if (productCategories.length === 0 && serviceCategories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-16">
        
        {/* Products Categories Section */}
        {productCategories.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Browse Product Categories</h2>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                  Explore supplier depth across core industrial product categories
                </p>
              </div>
              <Link
                href="/categories"
                className="text-sm font-semibold text-[#1d4ed8] hover:text-[#1e40af] transition-colors"
              >
                View All Categories &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {productCategories.map((category) => (
                <Link
                  key={category.title}
                  href={`/products/${category.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white hover:border-[#1d4ed8] hover:shadow-md transition-all duration-300"
                >
                  <div className="relative h-32 w-full bg-zinc-100 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-3.5 space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1 group-hover:text-[#1d4ed8] transition-colors leading-tight">
                      {category.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 flex-1 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="flex gap-2 text-[10px] text-zinc-400 py-1.5 border-t border-zinc-100 mt-1">
                      <span>{category.suppliers}</span>
                      <span>•</span>
                      <span>{category.subText}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Services Categories Section */}
        {serviceCategories.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Browse Service Categories</h2>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                  Industrial installation, maintenance, logistics, and consulting from verified providers
                </p>
              </div>
              <Link
                href="/services"
                className="text-sm font-semibold text-[#1d4ed8] hover:text-[#1e40af] transition-colors"
              >
                View All Services &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {serviceCategories.map((category) => (
                <Link
                  key={category.title}
                  href={`/services?category=${category.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white hover:border-[#1d4ed8] hover:shadow-md transition-all duration-300"
                >
                  <div className="relative h-32 w-full bg-zinc-100 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-3.5 space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1 group-hover:text-[#1d4ed8] transition-colors leading-tight">
                      {category.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 flex-1 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="flex gap-2 text-[10px] text-zinc-400 py-1.5 border-t border-zinc-100 mt-1">
                      <span>{category.suppliers}</span>
                      <span>•</span>
                      <span>{category.subText}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

