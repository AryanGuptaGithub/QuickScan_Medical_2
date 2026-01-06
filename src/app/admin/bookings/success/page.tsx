// app/booking/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiDownload,
  FiPrinter,
  FiMail,
} from "react-icons/fi";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        const data = await response.json();

        if (data.success) {
          setBooking(data.data);
        } else {
          setError(data.message || "Failed to load booking");
        }
      } catch (err) {
        setError("Failed to load booking details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Unable to Load Booking</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push("/booking")}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition ml-3"
            >
              Book Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <FiCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Booking Confirmed! 🎉</h1>
          <p className="text-gray-600">
            Your appointment has been successfully scheduled
          </p>
          <div className="mt-4 inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            Booking ID:{" "}
            <span className="font-bold ml-2">{booking.bookingId}</span>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Appointment Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <FiCalendar className="mt-1 mr-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="font-semibold">
                    {new Date(booking.appointmentDate).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>
                  <div className="text-gray-700">{booking.timeSlot}</div>
                </div>
              </div>

              <div className="flex items-start">
                <FiMapPin className="mt-1 mr-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-semibold">{booking.labName}</div>
                  <div className="text-gray-700">{booking.labAddress}</div>
                  <div className="text-sm text-gray-600">{booking.labCity}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Patient</div>
                <div className="font-semibold text-lg">
                  {booking.patientName}
                </div>
                <div className="text-gray-700">{booking.patientEmail}</div>
                <div className="text-gray-700">{booking.patientPhone}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Service</div>
                <div className="font-semibold">{booking.serviceName}</div>
                <div className="text-gray-700">
                  {booking.appointmentType === "home-service"
                    ? "Home Service"
                    : "Lab Visit"}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span className="font-medium">₹{booking.baseAmount}</span>
                </div>
                {booking.homeServiceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Home Service Charge</span>
                    <span className="font-medium">
                      ₹{booking.homeServiceCharge}
                    </span>
                  </div>
                )}
                {booking.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{booking.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span className="font-medium">₹{booking.taxAmount}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid</span>
                    <span className="text-blue-600">
                      ₹{booking.totalAmount}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment Status</span>
                  <span
                    className={`font-medium ${
                      booking.paymentStatus === "paid"
                        ? "text-green-600"
                        : booking.paymentStatus === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {booking.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            <FiDownload className="mr-2" />
            Download Receipt
          </button>
          <button className="flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
            <FiPrinter className="mr-2" />
            Print Details
          </button>
          <button className="flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
            <FiMail className="mr-2" />
            Email Confirmation
          </button>
          <Link
            href="/dashboard"
            className="flex items-center bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p className="mb-2">
            Need to make changes? Call us at{" "}
            <span className="font-semibold">1800-123-4567</span>
          </p>
          <p>A confirmation email has been sent to {booking.patientEmail}</p>
        </div>
      </div>
    </div>
  );
}
