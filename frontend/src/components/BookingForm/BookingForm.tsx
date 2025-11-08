import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DormData, RoomTypeData } from '../types/types' 
import './BookingForm.css'; 

interface BookingFormProps {
  dorm: DormData;
}

const BookingForm: React.FC<BookingFormProps> = ({ dorm }) => {
  const navigate = useNavigate();

  // (State สำหรับเก็บข้อมูลในฟอร์ม)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleConfirm = () => {
    // (ตรวจสอบข้อมูลเบื้องต้น)
    if (!selectedRoomTypeId || !startDate || !endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // (ค้นหาข้อมูล RoomType ที่เลือก เพื่อส่งราคาไปหน้า Payment)
    const selectedRoomType = dorm.room_types.find(
      (rt) => rt.room_type_id.toString() === selectedRoomTypeId
    );

    // (รวบรวมข้อมูลทั้งหมดเพื่อส่งไปหน้าจ่ายเงิน)
    const bookingDetails = {
      dormData: {
        dorm_id: dorm.dorm_id,
        dorm_name: dorm.dorm_name,
        medias: dorm.medias,
      },
      selectedRoomType: selectedRoomType, // (ส่ง Object ของ RoomType ไปเลย)
      startDate: startDate,
      endDate: endDate,
      // (TODO: คำนวณราคารวมที่ซับซ้อนกว่านี้)
      totalPrice: selectedRoomType ? selectedRoomType.rent_per_month : 0 
    };

    // (นำทางไปหน้า /payment พร้อมส่งข้อมูล)
    // (คุณต้องแน่ใจว่า <PaymentFlow> ใน App.tsx รับ state ชื่อ 'bookingDetails')
    navigate('/payment', { state: { bookingDetails: bookingDetails } }); 
  };

  return (
    <div className="booking-form-card">
      <h2 className="booking-form-title">กรุณากรอกรายละเอียดที่ต้องการจอง</h2>
      <p className="booking-form-subtitle">
        เนื่องจากหอพักไม่สามารถระบุหมายเลขห้องพักได้ ผู้ใช้จำเป็นต้องเลือกประเภทห้องพัก...
      </p>

      <form className="booking-form">
        {/* 1. ประเภทห้องพัก */}
        <div className="form-group">
          <label htmlFor="room-type">*ประเภทห้องพัก:</label>
          <select
            id="room-type"
            value={selectedRoomTypeId}
            onChange={(e) => setSelectedRoomTypeId(e.target.value)}
          >
            <option value="" disabled>เลือกประเภทห้องพัก</option>
            {dorm.room_types && dorm.room_types.length > 0 ? (
              // (FIX: ใช้ Type ที่ Import มา)
              dorm.room_types.map((rt: RoomTypeData) => ( 
                <option key={rt.room_type_id} value={rt.room_type_id}>
                  {rt.room_type_name} (ราคา {rt.rent_per_month} บาท)
                </option>
              ))
            ) : (
              <option disabled>ไม่พบประเภทห้องพัก (กรุณาซ่อม Backend)</option>
            )}
          </select>
        </div>

        {/* 2. วันที่ */}
        <div className="form-group">
          <label htmlFor="start-date">*วันที่ต้องการจอง:</label>
          <div className="date-range-picker">
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              // (กำหนด min date เป็นวันนี้)
              min={new Date().toISOString().split('T')[0]} 
            />
            <span>ถึง</span>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              // (กำหนด min date เป็นวันที่เริ่ม)
              min={startDate || new Date().toISOString().split('T')[0]} 
            />
          </div>
        </div>
      </form>

      {/* 3. ปุ่ม */}
      <div className="booking-form-actions">
        <button className="btn-confirm" onClick={handleConfirm}>
          ยืนยันการจอง
        </button>
      </div>
    </div>
  );
};

export default BookingForm;