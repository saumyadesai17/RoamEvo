import Image from "next/image";
import Link from "next/link";
import AdminAccess from "./AdminAccess";

export default function Footer() {
  return (
    <footer className="bg-[#F4F6F0] py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Links */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* International Trips */}
              <div>
                <h3 className="text-xl font-serif mb-6 text-gray-800">
                  International Trips
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Europe
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Bali
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Vietnam
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Turkey
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Thailand
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Azerbaijan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Singapore
                    </Link>
                  </li>
                </ul>
              </div>
              {/* India Trips */}
              <div>
                <h3 className="text-xl font-serif mb-6 text-gray-800">
                  India Trips
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Ladakh
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Spiti Valley
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Kashmir
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Andaman
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Kerala
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Rajasthan
                    </Link>
                  </li>
                </ul>
              </div>
              {/* Quick Links */}
              <div>
                <h3 className="text-xl font-serif mb-6 text-gray-800">
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Payments
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Contact & Copyright */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Contact Us */}
              <div>
                <h3 className="text-xl font-serif mb-6 text-gray-800">
                  Contact Us
                </h3>
                <address className="not-italic text-gray-600 space-y-3">
                  <p>
                    <a
                      href="tel:+919665398773"
                      className="hover:text-gray-900 underline"
                    >
                      +91 9665398773
                    </a>
                  </p>
                  <p>
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=roamevo@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 underline"
                    >
                      roamevo@gmail.com
                    </a>
                  </p>
                </address>
              </div>
              {/* Copyright */}
              <div className="flex items-end md:justify-end">
                <p className="text-gray-600 mt-8 md:mt-0">
                  © Roamevo, All rights reserved.
                </p>
                <AdminAccess />
              </div>
            </div>
          </div>
          {/* Right: Image */}
          <div className="hidden lg:block w-1/3 max-w-md">
            <div className="h-64 w-full relative rounded-md overflow-hidden">
              <Image
                src="/images/beach.png"
                alt="Beach with palm trees and hammock"
                fill
                className="object-cover"
                sizes="33vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
