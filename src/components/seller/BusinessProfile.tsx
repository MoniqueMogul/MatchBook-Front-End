"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/common/Button";
import type { SellerBusiness } from "@/lib/api/seller";
import BusinessImage from "./BusinessImage";

type Tab = "overview" | "information" | "goals" | "finances";
const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" }, { id: "information", label: "Business Information" },
  { id: "goals", label: "Sale Goals" }, { id: "finances", label: "Finances" },
];
const currency = (value: string | null) => value == null ? "Not provided" :
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
const acronyms: Record<string, string> = { llc: "LLC", b2b: "B2B", b2c: "B2C", d2c: "D2C" };
const text = (value: string | number | null | undefined) => value == null || value === "" ? "Not provided" : acronyms[String(value)] ?? String(value).replaceAll("_", " ");

export default function BusinessProfile({ business, onBack, onEdit, onUpdated, onBusyChange }: {
  business: SellerBusiness; onBack: () => void; onEdit: () => void; onUpdated: (business: SellerBusiness) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [imageBusy, setImageBusy] = useState(false);
  // Only business fields are selected. Personal and KYC records never enter this view.
  const information = [
    ["Legal business name", text(business.legal_name)], ["Doing business as", text(business.dba)],
    ["Industry", text(business.industry)], ["Sub-industry", text(business.sub_industry)],
    ["Business model", text(business.business_model)], ["Business type", text(business.business_type)],
    ["City", text(business.city)], ["State", text(business.state)], ["County", text(business.county)],
    ["ZIP code", text(business.zip_code)], ["Years in operation", text(business.years_in_operation)],
    ["Locations", text(business.number_of_locations)], ["Routes", text(business.number_of_routes)],
    ["Owner hours per week", text(business.owner_involvement_hours_per_week)],
  ];
  const goals = [
    ["Asking price", currency(business.asking_price)], ["Preferred sale timeline", text(business.preferred_sale_timeline)],
    ["Deal preference", text(business.deal_preference)], ["Transition training days", text(business.transition_training_days)],
  ];
  const finances = [
    ["Annual recurring revenue", currency(business.arr)], ["Seller discretionary earnings", currency(business.sde)],
    ["Largest customer concentration", business.customer_concentration == null ? "Not provided" : `${business.customer_concentration}%`],
  ];
  const details = (title: string, rows: string[][]) => <section className="business-profile__section">
    <h3>{title}</h3><dl className="business-profile__details">{rows.map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  </section>;

  return <section className="business-profile">
    <div className="business-profile__actions">
      <Button type="button" variant="secondary" disabled={imageBusy} onClick={onBack}>Back to Listings</Button>
      <Button type="button" disabled={imageBusy} onClick={onEdit}>Edit Business Profile</Button>
    </div>
    <BusinessImage key={business.id} business={business} onUpdated={onUpdated}
      onBusyChange={(busy) => { setImageBusy(busy); onBusyChange(busy); }} />
    <div className="business-profile__summary">
      <div><span className="business-profile__status">{text(business.status)}</span>
        <h2>{business.dba || business.legal_name || "Untitled business"}</h2>
        <p className="business-profile__location"><MapPin size={16} aria-hidden="true" />{business.city}, {business.state}</p>
        <p className="business-profile__classification">{text(business.industry)} · {text(business.business_model)}</p>
      </div>
      <dl className="business-profile__metrics">
        <div><dt>Asking price</dt><dd>{currency(business.asking_price)}</dd></div>
        <div><dt>Annual recurring revenue</dt><dd>{currency(business.arr)}</dd></div>
        <div><dt>Seller discretionary earnings</dt><dd>{currency(business.sde)}</dd></div>
      </dl>
    </div>
    <nav className="business-profile__tabs" aria-label="Business profile sections">
      {tabs.map((tab) => <button type="button" key={tab.id} aria-current={activeTab === tab.id ? "page" : undefined}
        onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
    </nav>
    {(activeTab === "overview" || activeTab === "information") && details("Business Information", information)}
    {(activeTab === "overview" || activeTab === "goals") && details("Sale Goals", goals)}
    {(activeTab === "overview" || activeTab === "finances") && details("Finances", finances)}
  </section>;
}
