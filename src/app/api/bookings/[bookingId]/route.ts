// app/api/bookings/[bookingId]/route.ts - UPDATED FOR NEXT.JS 14+
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/lib/models/Booking";
import mongoose from "mongoose";
import { auth } from "@/app/api/auth/[...nextauth]/route";

// 🔥 IMPORTANT: In Next.js 14+, params is a Promise!
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> } // params is Promise now
) {
  try {
    console.log(`📦 GET Booking details called`);

    // 🔥 AWAIT THE PARAMS
    const { bookingId } = await params;
    console.log(`📌 Booking ID: ${bookingId}`);

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      console.log("❌ No session found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`👤 User ID from session: ${userId}`);

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const booking = await Booking.findOne({
      bookingId: bookingId,
      userId: userObjectId,
    });

    if (!booking) {
      console.log(`❌ Booking not found or doesn't belong to user`);

      // Check if booking exists at all
      const anyBooking = await Booking.findOne({ bookingId: bookingId });
      if (anyBooking) {
        console.log(`📌 Booking exists but user mismatch`);
        console.log(`   Booking userId: ${anyBooking.userId}`);
        console.log(`   Current userId: ${userId}`);
      }

      return NextResponse.json(
        {
          success: false,
          message: "Booking not found or you don't have permission to view it",
        },
        { status: 404 }
      );
    }

    console.log(`✅ Found booking: ${booking.bookingId}`);
    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error("❌ Error fetching booking:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 🔥 Also update other methods (PUT, DELETE) if you have them
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params; // 🔥 AWAIT HERE TOO

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // First, check if booking belongs to user
    const existingBooking = await Booking.findOne({
      bookingId: bookingId,
      userId: userObjectId,
    });

    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found or access denied",
        },
        { status: 404 }
      );
    }

    // Your update logic here...
    const body = await request.json();

    const updatedBooking = await Booking.findOneAndUpdate(
      { bookingId, userId: userObjectId },
      body,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("❌ Error updating booking:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params; // 🔥 AWAIT HERE TOO

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const deletedBooking = await Booking.findOneAndDelete({
      bookingId: bookingId,
      userId: userObjectId,
    });

    if (!deletedBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found or access denied",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting booking:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete booking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
