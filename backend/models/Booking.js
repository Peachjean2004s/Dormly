const { parse } = require('path');
const pool = require('../config/database');

class Booking {
  // Validate booking data
  static validateBookingData(bookingData) {
    const errors = [];
    
    if (!bookingData.room_type_id || isNaN(bookingData.room_type_id)) {
      errors.push('Valid room type ID is required');
    }
    
    if (!bookingData.begin_at) {
      errors.push('Start date is required');
    }
    
    if (!bookingData.end_at) {
      errors.push('End date is required');
    }
    
    // Validate dates
    const beginDate = new Date(bookingData.begin_at);
    const endDate = new Date(bookingData.end_at);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    
    if (isNaN(beginDate.getTime())) {
      errors.push('Invalid start date');
    }
    
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    }
    
    const beginDateOnly = new Date(beginDate);
    beginDateOnly.setHours(0, 0, 0, 0);
    
    if (beginDateOnly < now) {
      errors.push('Start date cannot be in the past');
    }
    
    if (endDate <= beginDate) {
      errors.push('End date must be after start date');
    }
    
    return errors;
  }

  // Get booking by ID (for viewing booking details)
  static async getBookingById(bookingId) {
    try {
      if (!bookingId || isNaN(bookingId)) {
        throw new Error('Invalid booking ID');
      }

      const query = `
        SELECT 
          b.*,
          u.f_name || ' ' || u.l_name as booker_name,
          u.email as booker_email,
          r.room_name,
          rt.room_type_name,
          rt.room_type_desc,
          rt.max_occupancy,
          rt.deposit_amount as room_type_deposit,
          rt.rent_per_month,
          rt.rent_per_day,
          d.dorm_id,
          d.dorm_name,
          d.address,
          d.tel,
          d.line_id
        FROM "DormBookings" b
        JOIN "Users" u ON b.booker_id = u.user_id
        JOIN "Rooms" r ON b.room_id = r.room_id
        JOIN "RoomTypes" rt ON r.room_type_id = rt.room_type_id
        JOIN "Dorms" d ON rt.dorm_id = d.dorm_id
        WHERE b.booking_id = $1
      `;
      const result = await pool.query(query, [bookingId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw error;
    }
  }

  // Get bookings by user ID (for viewing user's bookings)
  static async getBookingsByUserId(userId) {
    try {
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID');
      }

      const query = `
        SELECT 
          b.*,
          r.room_name,
          rt.room_type_name,
          rt.max_occupancy,
          rt.deposit_amount as room_type_deposit,
          rt.rent_per_month,
          rt.rent_per_day,
          d.dorm_id,
          d.dorm_name,
          d.address,
          d.tel
        FROM "DormBookings" b
        JOIN "Rooms" r ON b.room_id = r.room_id
        JOIN "RoomTypes" rt ON r.room_type_id = rt.room_type_id
        JOIN "Dorms" d ON rt.dorm_id = d.dorm_id
        WHERE b.booker_id = $1
        ORDER BY b.created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching bookings by user ID:', error);
      throw error;
    }
  }

  // Get bookings for dorms owned by a specific dorm owner
  static async getBookingsByDormOwnerId(dormOwnerId) {
    try {
      if (!dormOwnerId || isNaN(dormOwnerId)) {
        throw new Error('Invalid dorm owner ID');
      }

      const query = `
        SELECT 
          b.*,
          u.f_name || ' ' || u.l_name as booker_name,
          u.email as booker_email,
          u.tel as booker_tel,
          r.room_name,
          rt.room_type_name,
          rt.room_type_desc,
          rt.max_occupancy,
          rt.deposit_amount as room_type_deposit,
          rt.rent_per_month,
          rt.rent_per_day,
          d.dorm_id,
          d.dorm_name,
          d.address,
          d.tel as dorm_tel
        FROM "DormBookings" b
        JOIN "Users" u ON b.booker_id = u.user_id
        JOIN "Rooms" r ON b.room_id = r.room_id
        JOIN "RoomTypes" rt ON r.room_type_id = rt.room_type_id
        JOIN "Dorms" d ON rt.dorm_id = d.dorm_id
        WHERE d.owner_id = $1
        ORDER BY b.created_at DESC
      `;
      const result = await pool.query(query, [dormOwnerId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching bookings by dorm owner ID:', error);
      throw error;
    }
  }

  // Get dorm owner ID by user ID
  static async getDormOwnerIdByUserId(userId) {
    try {
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID');
      }

      const query = `
        SELECT dorm_own_id 
        FROM "DormOwners"
        WHERE user_id = $1
      `;
      const result = await pool.query(query, [userId]);
      return result.rows[0]?.dorm_own_id || null;
    } catch (error) {
      console.error('Error fetching dorm owner ID:', error);
      throw error;
    }
  }

  // Check if room has conflicting bookings
  static async hasConflictingBooking(roomId, beginAt, endAt, excludeBookingId = null) {
    try {
      let query = `
        SELECT booking_id 
        FROM "DormBookings"
        WHERE room_id = $1
        AND status NOT IN ('cancelled', 'rejected')
        AND (
          (begin_at <= $2 AND end_at > $2) OR
          (begin_at < $3 AND end_at >= $3) OR
          (begin_at >= $2 AND end_at <= $3)
        )
      `;
      
      const params = [roomId, beginAt, endAt];
      
      if (excludeBookingId) {
        query += ` AND booking_id != $4`;
        params.push(excludeBookingId);
      }
      
      const result = await pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking conflicting bookings:', error);
      throw error;
    }
  }

  // Create a new booking
  static async createBooking(bookingData, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validate input data
      const validationErrors = this.validateBookingData(bookingData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID');
      }

      const { room_type_id, begin_at, end_at } = bookingData;

      // Get all rooms of this type with their max occupancy
      const roomsQuery = await client.query(
        `SELECT r.room_id, r.room_name, r.status, r.cur_occupancy,
                rt.room_type_name,
                rt.max_occupancy,
                rt.deposit_amount
         FROM "Rooms" r
         JOIN "RoomTypes" rt ON r.room_type_id = rt.room_type_id
         WHERE rt.room_type_id = $1
         ORDER BY r.cur_occupancy ASC, r.room_id ASC`,
        [room_type_id]
      );

      if (roomsQuery.rows.length === 0) {
        throw new Error('No rooms found for this room type');
      }

      // Find an available room that won't exceed max occupancy
      let selectedRoom = null;
      const depositAmount = parseFloat(roomsQuery.rows[0].deposit_amount);

      for (const room of roomsQuery.rows) {
        // Check current and future occupancy for this room during the booking period
        const occupancyCheck = await client.query(
          `SELECT COUNT(*) as booking_count
           FROM "DormBookings"
           WHERE room_id = $1
           AND status NOT IN ('ถูกยกเลิก', 'ปฏิเสธ', 'หมดสัญญาเช่า')
           AND (
             (begin_at <= $2 AND end_at > $2) OR
             (begin_at < $3 AND end_at >= $3) OR
             (begin_at >= $2 AND end_at <= $3)
           )`,
          [room.room_id, begin_at, end_at]
        );

        const currentBookings = parseInt(occupancyCheck.rows[0].booking_count);
        
        // Check if adding this booking would exceed max occupancy
        if (currentBookings < room.max_occupancy) {
          selectedRoom = room;
          break;
        }
      }

      if (!selectedRoom) {
        throw new Error('No available rooms for the selected dates. All rooms are at maximum occupancy.');
      }

      // Create booking
      const bookingQuery = `
        INSERT INTO "DormBookings" (booker_id, room_id, deposit_amount, created_at, begin_at, end_at, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await client.query(bookingQuery, [
        userId, 
        selectedRoom.room_id, 
        depositAmount,
        new Date(),
        begin_at, 
        end_at, 
        'รอการยืนยันจากเจ้าของหอพัก'
      ]);

      // Check if start date is today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(begin_at);
      startDate.setHours(0, 0, 0, 0);

      if (startDate.getTime() === today.getTime()) {
        // Update current occupancy if start date is today
        await client.query(
          'UPDATE "Rooms" SET cur_occupancy = cur_occupancy + 1 WHERE room_id = $1',
          [selectedRoom.room_id]
        );
      }

      // Update room status to occupied if this is the first/only booking
      const finalOccupancyCheck = await client.query(
        `SELECT COUNT(*) as active_bookings
         FROM "DormBookings"
         WHERE room_id = $1
         AND status NOT IN ('ถูกยกเลิก', 'ปฏิเสธ', 'หมดสัญญาเช่า')
         AND begin_at <= CURRENT_DATE
         AND end_at > CURRENT_DATE`,
        [selectedRoom.room_id]
      );

      const activeBookings = parseInt(finalOccupancyCheck.rows[0].active_bookings);
      
      if (activeBookings >= selectedRoom.max_occupancy) {
        await client.query(
          'UPDATE "Rooms" SET status = $1 WHERE room_id = $2',
          ['ห้องไม่ว่าง', selectedRoom.room_id]
        );
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating booking:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update booking status
  static async updateBookingStatus(bookingId, newStatus, userId) {
    try {
      if (!bookingId || isNaN(bookingId)) {
        throw new Error('Invalid booking ID');
      }

      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID');
      }

      // Validate status
      const validStatuses = ['รอการยืนยันจากเจ้าของหอพัก', 'รอการชำระเงินมัดจำ', 'ถูกยกเลิก', 'ปฏิเสธ', 'ชำระเงินมัดจำแล้ว', 'อยู่ระหว่างเช่า', 'หมดสัญญาเช่า'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Get booking details
      const bookingQuery = `
        SELECT 
          b.booking_id,
          b.booker_id,
          b.room_id,
          b.status,
          d.owner_id,
          do.user_id as owner_user_id
        FROM "DormBookings" b
        JOIN "Rooms" r ON b.room_id = r.room_id
        JOIN "RoomTypes" rt ON r.room_type_id = rt.room_type_id
        JOIN "Dorms" d ON rt.dorm_id = d.dorm_id
        JOIN "DormOwners" do ON d.owner_id = do.dorm_own_id
        WHERE b.booking_id = $1
      `;
      
      const bookingResult = await pool.query(bookingQuery, [bookingId]);

      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }

      const booking = bookingResult.rows[0];

      // Check authorization: either the booker or the dorm owner can update
      const isBooker = booking.booker_id === userId;
      const isOwner = booking.owner_user_id === userId;

      if (!isBooker && !isOwner) {
        throw new Error('Unauthorized: You can only update bookings for your own bookings or dorms you own');
      }

      // Bookers can only cancel their bookings
      if (isBooker && !isOwner && newStatus !== 'ถูกยกเลิก') {
        throw new Error('Bookers can only cancel their bookings');
      }

      // Update the booking status
      const updateQuery = `
        UPDATE "DormBookings" 
        SET status = $1 
        WHERE booking_id = $2 
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [newStatus, bookingId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
}

module.exports = Booking;