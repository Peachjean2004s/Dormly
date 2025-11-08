
// เจ้าของหอ
export interface DormOwner {
  f_name: string;
  l_name: string;
  profile_path: string;
}

// ผู้ใช้ที่เขียนรีวิว
export interface ReviewUser {
  f_name: string;
  l_name: string;
  profile_path: string;
}

// ข้อมูลรีวิว
export interface ReviewData {
  review_id: number;
  content: string;
  score: number;
  created_at: string;
  user: ReviewUser;
}

// ข้อมูลหอพัก (ข้อมูลหลัก)
export interface DormData {
  dorm_id: number;
  dorm_name: string;
  description: string;
  lat: number;
  long: number;
  address: string;
  prov: string;
  dist: string;
  subdist: string;
  avg_score: number; // (API ส่งมาเป็น String เช่น "4.9")
  likes: number;
  medias: string[];
  tel: string;
  line_id: string;
  owner: DormOwner;
  facilities: string[]; 
  reviews: ReviewData[];
}

// ข้อมูลห้องพัก (แยก fetch)
export interface RoomData {
  room_id: string;
  room_name?: string;
  status: 'ห้องว่าง' | 'ห้องไม่ว่าง' | string;
  room_type_name: string;
  rent_per_month: number;
  imageUrl: string; 
  max_occupancy: number; // (field นี้สำคัญ)
}

// ประเภทของแท็บทั้งหมด
export type ActiveTab = 'details' | 'rooms' | 'booking' | 'facilities' | 'rules' | 'reviews' | 'map' | 'other';

// "รูปร่าง" ของ API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface RoomTypeData {
  room_type_id: number;
  room_type_name: string;
  rent_per_month: number;
  // (เพิ่ม field อื่นๆ ที่ API ส่งมาได้เลย)
}

// (อัปเดต Interface นี้)
export interface DormData {
  dorm_id: number;
  dorm_name: string;
  description: string;
  lat: number;
  long: number;
  address: string;
  prov: string;
  dist: string;
  subdist: string;
  avg_score: number;
  likes: number;
  medias: string[];
  tel: string;
  line_id: string;
  owner: DormOwner;
  facilities: string[]; 
  reviews: ReviewData[];

  // vvvv FIX: เพิ่มบรรทัดนี้กลับเข้ามา vvvv
  room_types: RoomTypeData[]; 
}