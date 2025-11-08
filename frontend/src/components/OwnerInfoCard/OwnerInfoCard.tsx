import React from 'react';
import './OwnerInfoCard.css'; // (เราจะสร้างไฟล์ CSS นี้)

// (Type สำหรับข้อมูล Owner ที่ API ส่งมา)
interface OwnerData {
  f_name: string;
  l_name: string;
  profile_path?: string; // (อาจเป็น optional)
  tel: string;
  line_id: string;
  avg_score: number;
  review_count: number;
}

interface Props {
  ownerData: OwnerData;
}

const OwnerInfoCard: React.FC<Props> = ({ ownerData }) => {
  // แปลง String "4.0" เป็น Number 4.0
  const avgScoreNumber = Number(ownerData.avg_score);

  return (
    <section className="info-section">
      <h4>Owner Information</h4>
      <div className="owner-card-v2">
        <div className="owner-avatar-placeholder-v2">
          {/* (Placeholder) */}
        </div>
        <strong className="owner-name">
          {ownerData.f_name} {ownerData.l_name}
        </strong>
        <span className="owner-handle">
          @{ownerData.line_id}
        </span>
        
        <div className="owner-rating">
          {'⭐'.repeat(Math.round(avgScoreNumber))}
          <span> {avgScoreNumber.toFixed(1)} ({ownerData.review_count || 0} รีวิว)</span>
        </div>

        <div className="owner-details-list">
          <p><strong>ชื่อ:</strong> <span>{ownerData.f_name} {ownerData.l_name}</span></p>
          <p><strong>เบอร์โทร:</strong> <span>{ownerData.tel}</span></p>
          <p><strong>Line:</strong> <span>{ownerData.line_id}</span></p>
        </div>
        
        <button className="view-owner-details-btn-v2">ดูข้อมูลเพิ่มเติม</button>
      </div>
    </section>
  );
};

export default OwnerInfoCard;