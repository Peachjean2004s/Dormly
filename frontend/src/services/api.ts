import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// ========================================
// AUTH APIs
// ========================================

export const authAPI = {
  /**
   * Login user
   */
  login: async (credentials: {
    username: string;
    password: string;
  }) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user (Step 1: Account)
   */
  register: async (userData: {
    f_name: string;
    l_name: string;
    national_id: string;
    email: string;
    username: string;
    password: string;
    sex?: string;
  }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Check if username exists
   */
  checkUsername: async (username: string) => {
    try {
      await apiClient.get(`/users/username/${username}`);
      return true; // Username exists
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false; // Username available
      }
      throw error;
    }
  },

  /**
   * Check if email exists
   */
  checkEmail: async (email: string) => {
    try {
      const response = await apiClient.get('/users', { params: { email } });
      return response.data.data.length > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current user info
   */
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// ========================================
// DORM APIs
// ========================================

export const dormAPI = {
  /**
   * Create new dorm (Step 2, 3, 4 combined)
   */
  createDorm: async (dormData: {
    dorm_name: string;
    description?: string;
    water_cost_per_unit?: number;
    power_cost_per_unit?: number;
    tel?: string;
    line_id?: string;
    lat: number;
    long: number;
    address?: string;
    soi?: string;
    moo?: string;
    road?: string;
    prov?: string;
    dist?: string;
    subdist?: string;
    postal_code?: number;
  }) => {
    const response = await apiClient.post('/dorms', dormData);
    return response.data;
  },

  /**
   * Get dorm by ID
   */
  getDormById: async (dormId: number) => {
    const response = await apiClient.get(`/dorms/${dormId}`);
    return response.data;
  },
};

// ========================================
// ROOM TYPE APIs
// ========================================

export const roomTypeAPI = {
  /**
   * Create room type with rooms
   */
  createRoomTypeWithRooms: async (data: {
    dorm_id: number;
    room_type_name: string;
    room_type_desc?: string;
    max_occupancy: number;
    rent_per_month: number;
    rent_per_day?: number;
    deposit_amount: number;
    room_count?: number;
    room_name_prefix?: string;
  }) => {
    const response = await apiClient.post('/rooms/room-type-with-rooms', data);
    return response.data;
  },
};

// ========================================
// FACILITY APIs
// ========================================

export const facilityAPI = {
  /**
   * Get all facilities
   */
  getAllFacilities: async () => {
    // Note: You'll need to create this endpoint in backend
    // For now, return hardcoded list
    return {
      success: true,
      data: [
        { faci_id: 1, faci_name: 'Wifi' },
        { faci_id: 2, faci_name: 'แอร์' },
        { faci_id: 3, faci_name: 'ที่จอดรถ' },
        { faci_id: 4, faci_name: 'กล้องวงจรปิด' },
        { faci_id: 5, faci_name: 'ฟิตเนส' },
        { faci_id: 6, faci_name: 'สระว่ายน้ำ' },
        { faci_id: 7, faci_name: 'รปภ.' },
        { faci_id: 8, faci_name: 'ลิฟต์' },
        { faci_id: 9, faci_name: 'Key Card' },
        { faci_id: 10, faci_name: 'ที่ชาร์จรถยนต์ไฟฟ้า' },
        { faci_id: 11, faci_name: 'พื้นที่ส่วนกลาง' },
        { faci_id: 12, faci_name: 'ตู้เย็น' },
        { faci_id: 13, faci_name: 'เครื่องทำน้ำอุ่น' },
        { faci_id: 14, faci_name: 'เตาไมโครเวฟ' },
        { faci_id: 15, faci_name: 'ห้องอ่านหนังสือ' },
        { faci_id: 16, faci_name: 'ตู้จำหน่ายสินค้าอัตโนมัติ' },
        { faci_id: 17, faci_name: 'ที่จอดจักรยาน' },
        { faci_id: 18, faci_name: 'Pet Friendly' },
        { faci_id: 19, faci_name: 'ร้านสะดวกซื้อ' },
        { faci_id: 20, faci_name: 'ร้านอาหาร หรือ คาเฟ่' },
      ],
    };
  },

  /**
   * Add facilities to dorm
   */
  addDormFacilities: async (dormId: number, facilityNames: string[]) => {
    // Note: You'll need to create this endpoint in backend
    // Endpoint: POST /api/dorms/:dormId/facilities
    const response = await apiClient.post(`/dorms/${dormId}/facilities`, {
      facilities: facilityNames,
    });
    return response.data;
  },
};

// ========================================
// MEDIA APIs
// ========================================

export const mediaAPI = {
  /**
   * Upload dorm images
   */
  uploadDormImages: async (dormId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('media', file);
    });

    const response = await apiClient.post(`/media/dorm/${dormId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload room type images
   */
  uploadRoomTypeImages: async (roomTypeId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('media', file);
    });

    // Note: You may need to create this endpoint in backend
    const response = await apiClient.post(`/media/room-type/${roomTypeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get media URL
   */
  getMediaUrl: (filename: string) => {
    return `${API_BASE_URL}/media/file/${filename}`;
  },
};

// ========================================
// PAYMENT APIs
// ========================================

export const paymentAPI = {
  /**
   * Create credit card charge
   */
  createCreditCardCharge: async (data: {
    token: string;
    amount: number;
    userId: number;
    dormId: number;
  }) => {
    const response = await apiClient.post('/payment/create-charge', data);
    return response.data;
  },

  /**
   * Create PromptPay QR charge
   */
  createQRCharge: async (data: {
    amount: number;
    userId: number;
    dormId: number;
  }) => {
    const response = await apiClient.post('/payment/create-qr-charge', data);
    return response.data;
  },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Handle API errors and return user-friendly messages
 */
export const handleAPIError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || error.response.statusText;
    return message;
  } else if (error.request) {
    // Request made but no response
    return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
  } else {
    // Something else happened
    return error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }
};

export default apiClient;