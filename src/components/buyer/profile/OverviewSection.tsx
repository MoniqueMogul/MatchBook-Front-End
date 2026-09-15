"use client";

import "./OverviewSection.css";

export interface OverviewData {
  about?: string;
  preferredRegions?: string[];
  industriesOfInterest?: string[];
}

interface OverviewSectionProps {
  data?: OverviewData;
}

const defaultData: Required<OverviewData> = {
  about:
    "lorem ipsum dolor sit amet consectetur adipiscing elit omnis fuga quo laboris magna blanditiis est harum magna aliqua ipsum qui maxime lorem odio atque laboris veniam excepteur molestias tempor vel sunt lorem ipsum dolor sit amet consectetur adipiscing elit omnis fuga quo laboris magna blanditiis est harum magna aliqua ipsum qui maxime lorem odio atque laboris veniam excepteur molestias tempor vel sunt",
  preferredRegions: ["Location 1", "Location 3", "Location 2"],
  industriesOfInterest: [
    "Placeholder text",
    "Placeholder text",
    "Placeholder text",
  ],
};

export default function OverviewSection({
  data = defaultData,
}: OverviewSectionProps) {
  return (
    <section className="overview-section">
      <div className="overview-section__information overview-section__information--about">
        <h2 className="overview-section__title">About</h2>

        <p className="overview-section__description">
          {data.about}
        </p>
      </div>

      <div className="overview-section__information">
        <h2 className="overview-section__title">
          Preferred Regions
        </h2>

        <div className="overview-section__pills">
          {data.preferredRegions.map((region, index) => (
            <span
              key={`${region}-${index}`}
              className="overview-section__pill"
            >
              {region}
            </span>
          ))}
        </div>
      </div>

      <div className="overview-section__information">
        <h2 className="overview-section__title">
          Industries of Interest
        </h2>

        <div className="overview-section__pills">
          {data.industriesOfInterest.map((industry, index) => (
            <span
              key={`${industry}-${index}`}
              className="overview-section__pill"
            >
              {industry}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}