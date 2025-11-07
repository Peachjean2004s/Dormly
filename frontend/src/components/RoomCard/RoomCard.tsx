import React from 'react';
import './RoomCard.css'; // (อย่าลืมสร้างไฟล์ CSS สำหรับการ์ดด้วย)

// (นี่คือ Type เดียวกับที่ใช้ใน DormDetailPage)
interface RoomData {
  room_id: string;
  room_name?: string;
  status: 'ห้องว่าง' | 'ห้องไม่ว่าง' | string;
  room_type_name: string;
  imageUrl: string;
}

interface RoomCardProps {
  room: RoomData;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  
  // (ตรวจสอบสถานะเพื่อเปลี่ยนสี CSS)
  const statusClassName = room.status === 'ห้องว่าง' 
    ? 'status-available' 
    : 'status-filled';

  return (
    <div className="room-card">
      <div className="room-image-placeholder">
        {/* <img src={room.imageUrl} alt={room.room_type_name} /> */}
        [Image Placeholder]
      </div>
      <div className="room-card-content">
        
        {/* (แสดงหมายเลขห้อง ถ้ามีข้อมูลส่งมา) */}
        {room.room_name && (
          <p><strong>ห้อง: {room.room_name}</strong></p>
        )}
        
        <p>ประเภท: {room.room_type_name}</p>
        <p>สถานะ: <span className={statusClassName}>{room.status}</span></p>
        
        <button className="view-details-btn">ดูรายละเอียด</button>
      </div>
    </div>
  );
};

export default RoomCard;