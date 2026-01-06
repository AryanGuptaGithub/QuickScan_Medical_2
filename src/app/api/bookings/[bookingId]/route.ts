// app/api/bookings/[bookingId]/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/lib/models/Booking";
import mongoose from "mongoose";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    console.log(`📦 GET Booking details for: ${params.bookingId}`);

    // 🔥 GET ACTUAL AUTHENTICATED USER
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    await connectDB();

    // Convert string ID to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 🔥 Find booking AND verify it belongs to the user
    const booking = await Booking.findOne({
      bookingId: params.bookingId,
      userId: userObjectId, // Filter by user ID
    });

    if (!booking) {
      console.log(
        `❌ Booking ${params.bookingId} not found or access denied for user ${userId}`
      );
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found or you don't have permission to view it",
        },
        { status: 404 }
      );
    }

    console.log(`✅ Found booking ${params.bookingId} for user ${userId}`);

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

// Similarly update PUT and DELETE methods to check user ownership
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
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
      bookingId: params.bookingId,
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

    // Update logic here...
    // ... rest of your PUT logic
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
