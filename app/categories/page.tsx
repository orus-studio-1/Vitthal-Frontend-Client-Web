"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "@/components/Landing_Page";
import { Loader2, Search, ArrowRight, Grid, LayoutGrid } from "lucide-react";

type Category = {
    id: string;
    code: string;
    label: string;
    description: string;
    image: string;
    suppliers: string;
    products: string;
};

function getCategoryStats(code: string) {
    switch (code) {
        case 'plastic':
            return { suppliers: "1,140+", products: "8,200+" };
        case 'metal':
            return { suppliers: "920+", products: "6,500+" };
        case 'chemicals':
            return { suppliers: "840+", products: "5,900+" };
        case 'construction':
            return { suppliers: "720+", products: "4,800+" };
        case 'machinery':
            return { suppliers: "610+", products: "4,200+" };
        case 'packaging':
            return { suppliers: "530+", products: "3,800+" };
        case 'textiles':
            return { suppliers: "480+", products: "3,400+" };
        case 'automotive':
            return { suppliers: "410+", products: "2,900+" };
        case 'agriculture':
            return { suppliers: "390+", products: "2,500+" };
        case 'electrical':
            return { suppliers: "350+", products: "2,200+" };
        default:
            return { suppliers: "500+", products: "3,500+" };
    }
}

export default function CategoriesPage() {
    const [productCategories, setProductCategories] = useState<Category[]>([]);
    const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<"products" | "services">("products");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            try {
                const [prodRes, servRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"}/api/products/getCategories?type=product`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"}/api/products/getCategories?type=service`)
                ]);

                if (prodRes.ok) {
                    const resData = await prodRes.json();
                    if (resData.data) {
                        const mapped = resData.data.map((c: any) => {
                            const stats = getCategoryStats(c.code);
                            return {
                                id: c.id,
                                code: c.code,
                                label: c.label,
                                description: c.description || "",
                                image: c.image || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=80",
                                suppliers: stats.suppliers,
                                products: stats.products,
                            };
                        });
                        setProductCategories(mapped);
                    }
                }

                if (servRes.ok) {
                    const resData = await servRes.json();
                    if (resData.data) {
                        const mapped = resData.data.map((c: any) => {
                            return {
                                id: c.id,
                                code: c.code,
                                label: c.label,
                                description: c.description || "",
                                image: c.image || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
                                suppliers: "Verified Providers",
                                products: "Industrial Services",
                            };
                        });
                        setServiceCategories(mapped);
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

    const categories = activeTab === "products" ? productCategories : serviceCategories;

    const filteredCategories = categories.filter((cat) =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50">

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-zinc-900 py-20 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.15),transparent_45%)]" />
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 ring-1 ring-blue-500/20">
                            <LayoutGrid size={12} /> Industrial Sectors
                        </span>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Browse Core Categories
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
                            Discover verified manufacturers, bulk suppliers, and high-performance products and services across our active industrial supply networks.
                        </p>

                        {/* Premium Search Box */}
                        <div className="mx-auto mt-8 max-w-md relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder={`Search ${activeTab} categories...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none backdrop-blur-sm transition focus:border-blue-500 focus:bg-zinc-800"
                            />
                        </div>
                    </div>
                </section>

                {/* Tab Switcher */}
                <div className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-14 items-center justify-center gap-6">
                            <button
                                onClick={() => { setActiveTab("products"); setSearchQuery(""); }}
                                className={`h-full border-b-2 px-4 text-sm font-semibold transition-all ${
                                    activeTab === "products"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                                }`}
                            >
                                Product Categories
                            </button>
                            <button
                                onClick={() => { setActiveTab("services"); setSearchQuery(""); }}
                                className={`h-full border-b-2 px-4 text-sm font-semibold transition-all ${
                                    activeTab === "services"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                                }`}
                            >
                                Service Categories
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex min-h-[30vh] items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        </div>
                    ) : filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredCategories.map((category) => (
                                <article
                                    key={category.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs transition hover:-translate-y-1 hover:shadow-md duration-300"
                                >
                                    <div>
                                        {/* Cover Image */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                                            <Image
                                                src={category.image}
                                                alt={category.label}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        {/* Card Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-zinc-950 group-hover:text-blue-600 transition-colors">
                                                {category.label}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-zinc-600 line-clamp-3">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-100 p-6 pt-4">
                                        {/* Stats */}
                                        <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-3 text-center">
                                            <div>
                                                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                                    {activeTab === "products" ? "Suppliers" : "Providers"}
                                                </span>
                                                <span className="text-sm font-bold text-zinc-800">{category.suppliers}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                                    {activeTab === "products" ? "Products" : "Type"}
                                                </span>
                                                <span className="text-sm font-bold text-zinc-800">{category.products}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={
                                                activeTab === "products"
                                                    ? `/products/${category.code}`
                                                    : `/services?category=${category.id}`
                                            }
                                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 transition"
                                        >
                                            Explore catalog <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-zinc-500">No categories found matching &quot;{searchQuery}&quot;.</p>
                        </div>
                    )}
                </section>
            </main>

        </div>
    );
}