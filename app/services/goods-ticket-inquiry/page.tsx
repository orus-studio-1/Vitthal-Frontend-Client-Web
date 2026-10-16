"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Package, Plus, Trash2, Upload, X } from "lucide-react";
import { createServiceTicket, fetchServiceCategories } from "@/lib/api/serviceHub";
import { isGoodsTicketInquiryService } from "@/lib/services/goodsTicketInquiry";
import { useAuthStore } from "@/store/authStore";
import MapPicker, { type MapLocationData } from "@/components/shared/MapPicker";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

function localDateTimeValue() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

type GoodsInquiryItem = {
  id: string;
  itemName: string;
  quantity: string;
  unit: string;
  image: { name: string; key: string; url: string } | null;
  uploading: boolean;
};

function createGoodsInquiryItem(): GoodsInquiryItem {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    itemName: "",
    quantity: "1",
    unit: "pcs",
    image: null,
    uploading: false,
  };
}

export default function GoodsTicketInquiryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [categoryId, setCategoryId] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [companyLocation, setCompanyLocation] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderPlacedBy, setOrderPlacedBy] = useState("");
  const [orderDateTime, setOrderDateTime] = useState("");
  const [items, setItems] = useState<GoodsInquiryItem[]>([createGoodsInquiryItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ id: string; ticket_number: string } | null>(null);

  useEffect(() => {
    setOrderDateTime(localDateTimeValue());
    fetchServiceCategories()
      .then((categories) => {
        const category = categories.find(isGoodsTicketInquiryService);
        if (category) setCategoryId(category.id);
      })
      .catch((error) => console.error("Failed to load goods ticket category:", error))
      .finally(() => setCategoryLoading(false));
  }, []);

  function updateItem(itemId: string, updates: Partial<GoodsInquiryItem>) {
    setItems((current) => current.map((item) => item.id === itemId ? { ...item, ...updates } : item));
  }

  async function uploadItemImage(itemId: string, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      toast.error("Choose an image no larger than 8 MB.");
      return;
    }
    try {
      updateItem(itemId, { uploading: true });
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const uploaded = await response.json();
      if (!response.ok || !uploaded.success || !uploaded.fileName) {
        throw new Error(uploaded.message || "Could not upload the item image.");
      }
      let url = uploaded.fileName as string;
      const urlResponse = await fetch(
        `${API_BASE_URL}/api/upload/file?fileName=${encodeURIComponent(uploaded.fileName)}`,
        { credentials: "include" },
      );
      if (urlResponse.ok) {
        const fileResult = await urlResponse.json();
        url = fileResult.url || url;
      }
      const item = items.find((entry) => entry.id === itemId);
      updateItem(itemId, { image: { name: file.name, key: uploaded.fileName, url }, itemName: item?.itemName || file.name.replace(/\\.[^.]+$/, "") });
      toast.success("Item image attached.");
    } catch (error: any) {
      toast.error(error.message || "Could not upload the item image.");
    } finally {
      updateItem(itemId, { uploading: false });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      router.push("/login?redirect=/services/goods-ticket-inquiry");
      return;
    }
    if (!categoryId) {
      toast.error("The Goods Ticket Inquiry category is not configured yet.");
      return;
    }
    if (items.some((item) => !item.itemName.trim() || !item.quantity || Number(item.quantity) <= 0 || !item.image)) {
      toast.error("Add a name, valid quantity, and image for every item.");
      return;
    }
    try {
      setSubmitting(true);
      const result = await createServiceTicket({
        category_id: categoryId,
        priority: "medium",
        ticket_payload: {
          service_name: "Goods Ticket Inquiry",
          service_code: "goods_ticket_inquiry",
          job_title: `Goods order by ${orderPlacedBy.trim()}`,
          goods_items: items.map((item) => ({
            id: item.id,
            item_name: item.itemName.trim(),
            quantity: Number(item.quantity),
            unit: item.unit,
          })),
          company_google_location: companyLocation.trim(),
          company_location_latitude: locationCoordinates?.lat ?? null,
          company_location_longitude: locationCoordinates?.lng ?? null,
          google_maps_url: locationCoordinates
            ? `https://www.google.com/maps/search/?api=1&query=${locationCoordinates.lat},${locationCoordinates.lng}`
            : /^https?:\/\/(www\.)?google\.[^\s]+/i.test(companyLocation.trim())
              ? companyLocation.trim()
              : null,
          mobile_number: mobileNumber.trim(),
          delivery_date: deliveryDate,
          order_placed_by: orderPlacedBy.trim(),
          order_placed_at: orderDateTime,
        },
        documents: items.flatMap((item) => item.image ? [{
          doc_type: "goods_item_image",
          doc_name: item.image.name,
          doc_url: item.image.key,
          metadata: { item_id: item.id, item_name: item.itemName.trim() },
        }] : []),
      });
      setCreatedTicket({ id: result.id, ticket_number: result.ticket_number });
      toast.success("Goods ticket enquiry sent to service vendors.");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit goods ticket enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link href="/services" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Service Hub
        </Link>

        {createdTicket ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
            <CheckCircle2 className="mx-auto h-12 w-12 rounded-full bg-blue-50 p-3 text-blue-600" />
            <h1 className="mt-4 text-xl font-semibold text-zinc-900">Goods Ticket Enquiry Sent</h1>
            <p className="mt-1 font-mono text-sm font-semibold text-blue-600">{createdTicket.ticket_number}</p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">Vendors can now prepare quotations. Review their amounts and attachments in your ticket room.</p>
            <Link href={`/services/tickets/${createdTicket.id}`} className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-700">Open Ticket Room</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><Package className="h-3.5 w-3.5" /> Goods</span>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">Goods Ticket Inquiry</h1>
              <p className="mt-1 text-sm text-zinc-500">Add each requested item and its image. Vendors will review them individually and send quotations through your ticket room.</p>
            </div>

            {categoryLoading ? (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-4 text-xs text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading service category...</div>
            ) : !categoryId ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">The Goods Ticket Inquiry service category is not configured. Please contact support.</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                <label className="block text-sm font-medium text-zinc-700">Company Google location *
                  <input required value={companyLocation} onChange={(event) => { setCompanyLocation(event.target.value); setLocationCoordinates(null); }} placeholder="Search for the company location or paste its Google Maps link" className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                </label>
                <div className="space-y-2 rounded-lg border border-zinc-200 p-3">
                  <p className="text-xs font-semibold text-zinc-700">Choose the company location</p>
                  <MapPicker
                    latitude={locationCoordinates?.lat ?? null}
                    longitude={locationCoordinates?.lng ?? null}
                    height="260px"
                    onChange={(lat: number, lng: number, locationData?: MapLocationData) => {
                      setLocationCoordinates({ lat, lng });
                      if (locationData?.displayName) setCompanyLocation(locationData.displayName);
                    }}
                  />
                  {locationCoordinates && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${locationCoordinates.lat},${locationCoordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Open company location in Google Maps
                    </a>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-zinc-700">Mobile number *
                    <input required type="tel" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700">Required delivery date *
                    <input required type="date" min={localDateTimeValue().slice(0, 10)} value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700">Order placed by *
                    <input required value={orderPlacedBy} onChange={(event) => setOrderPlacedBy(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700">Order date and time *
                    <input required type="datetime-local" value={orderDateTime} onChange={(event) => setOrderDateTime(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                  </label>
                </div>
                <section className="space-y-3 rounded-lg border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><h2 className="text-sm font-semibold text-zinc-900">Requested items *</h2><p className="mt-0.5 text-xs text-zinc-500">Add each item with its own image, quantity, and unit.</p></div>
                    <button type="button" onClick={() => setItems((current) => [...current, createGoodsInquiryItem()])} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Plus className="h-3.5 w-3.5" /> Add item</button>
                  </div>
                  {items.map((item, index) => (
                    <article key={item.id} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3">
                      <div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-zinc-800">Item {index + 1}</h3>{items.length > 1 && <button type="button" aria-label={`Remove item ${index + 1}`} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded p-1 text-zinc-500 hover:bg-white hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>}</div>
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_110px_130px]">
                        <label className="block text-xs font-medium text-zinc-700">Item name *<input required value={item.itemName} onChange={(event) => updateItem(item.id, { itemName: event.target.value })} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" placeholder="Enter item name" /></label>
                        <label className="block text-xs font-medium text-zinc-700">Quantity *<input required type="number" min="0.01" step="any" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: event.target.value })} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" /></label>
                        <label className="block text-xs font-medium text-zinc-700">Unit *<select value={item.unit} onChange={(event) => updateItem(item.id, { unit: event.target.value })} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm">{["pcs", "kg", "litre", "numbers", "set"].map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:border-blue-400"><Upload className="h-4 w-4" />{item.uploading ? "Uploading..." : item.image ? "Replace item image" : "Upload item image *"}<input type="file" accept="image/*" className="sr-only" disabled={item.uploading} onChange={(event) => { void uploadItemImage(item.id, event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></label>
                        {item.image && <><img src={item.image.url} alt={`Preview of ${item.itemName || item.image.name}`} className="h-16 w-20 rounded-md border border-zinc-200 bg-white object-contain" /><a href={item.image.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-700 hover:underline">Preview {item.itemName || "item image"}</a><button type="button" onClick={() => updateItem(item.id, { image: null })} aria-label="Remove item image" className="rounded p-1 text-zinc-500 hover:bg-white hover:text-rose-600"><X className="h-4 w-4" /></button></>}
                      </div>
                    </article>
                  ))}
                </section>
                <button type="submit" disabled={submitting || items.some((item) => item.uploading)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Confirm Order & Send Enquiry
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
