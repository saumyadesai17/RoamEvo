import type { Metadata } from "next";
import { Gideon_Roman } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import StructuredData from "@/components/StructuredData";

const gideonRoman = Gideon_Roman({
  subsets: ["latin"],
  weight: "400", // only one weight available
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // include only the weights you need
  display: "swap",
  variable: "--font-montserrat", // this lets you use it in Tailwind CSS
});

export const metadata: Metadata = {
  title: {
    default: "Roamevo | Adventure Travel & Himalayan Tours in India",
    template: "%s | Roamevo"
  },
  description: "Discover expertly curated adventure tours across Uttarakhand, Kashmir, Manali, and Rajasthan. Experience authentic Himalayan journeys, river rafting, trekking, and cultural immersion with Roamevo.",
  keywords: ["travel packages India", "Uttarakhand tours", "Kashmir trips", "Manali adventure", "Himalayan treks", "river rafting", "mountain camping", "India travel company"],
  authors: [{ name: "Roamevo Travel" }],
  creator: "Roamevo",
  publisher: "Roamevo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://roamevo.in',
    siteName: 'Roamevo',
    title: 'Roamevo | Adventure Travel & Himalayan Tours in India',
    description: 'Discover expertly curated adventure tours across Uttarakhand, Kashmir, Manali, and Rajasthan. Experience authentic Himalayan journeys with Roamevo.',
    images: [
      {
        url: 'https://roamevo.in/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'Roamevo - Adventure Travel in the Himalayas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roamevo | Adventure Travel & Himalayan Tours in India',
    description: 'Discover expertly curated adventure tours across Uttarakhand, Kashmir, Manali, and Rajasthan.',
    images: ['https://roamevo.in/images/hero.png'],
  },
  alternates: {
    canonical: 'https://roamevo.in',
  },
  verification: {
    google: 'your-google-verification-code', // You'll get this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Roamevo",
    "url": "https://roamevo.in",
    "logo": "https://roamevo.in/images/logo.png",
    "description": "Expert-curated adventure tours across Uttarakhand, Kashmir, Manali, and Rajasthan. Authentic Himalayan journeys, river rafting, trekking, and cultural immersion.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9665398773",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://roamevo.in"
    ],
    "serviceArea": {
      "@type": "Place",
      "name": "India"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Adventure Tours",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "TouristTrip",
            "name": "Uttarakhand Adventure Tour",
            "description": "5-day Himalayan adventure including Auli, Chopta, Tungnath trek, and river rafting"
          }
        }
      ]
    }
  };

  return (
    <html lang="en">
      <head>
        <StructuredData data={organizationData} />
      </head>
      <body
        className={`${gideonRoman.className} ${montserrat.variable} antialiased`}
      >
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
