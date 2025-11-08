import React from 'react';
import './RoomCard.css'; 
import { useNavigate } from 'react-router-dom';
import { RoomData } from '../../components/types/types';


interface RoomCardProps {
  room: RoomData;
  onViewDetails: (room: RoomData) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onViewDetails }) => {
  // (เราไม่ใช้ navigate ที่นี่แล้ว)

  const statusClassName = room.status === 'ห้องว่าง' 
    ? 'status-available' 
    : 'status-filled';
  
  const handleClick = () => {
    onViewDetails(room);
  };

  return (
    <div className="room-card">
      
      <div className="room-image-placeholder">
        [Image Placeholder]
      </div>

      <div className="room-card-content">
        {room.room_name && (
          <p><strong>ห้อง: {room.room_name}</strong></p>
        )}
        <p>ประเภท: {room.room_type_name}</p>
        <p>สถานะ: <span className={statusClassName}>{room.status}</span></p>
        
        <button className="view-details-btn" onClick={handleClick}>
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
};

export default RoomCard;