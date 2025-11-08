import { useState, useEffect, useRef, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

// Declare google maps type
declare global {
    interface Window {
        google: any;
    }
    }

    type Step = "account" | "document" | "location" | "details" | "payment";

interface RoomType {
    id: string;
    roomTypeName: string;
    roomTypeDesc: string;
    maxOccupancy: string;
    rentPerMonth: string;
    rentPerDay: string;
    depositAmount: string;
    images: File[];              //รูปภาพของประเภทห้องนี้
    facilities: string[];        //สิ่งอำนวยความสะดวกของประเภทห้องนี้
}

    // (REGD-02) ประเภทสำหรับเก็บข้อผิดพลาดแบบ inline
    type ErrorState = {
    [key: string]: string;
    };

    // (REGD-06) ค่าคงที่สำหรับการตรวจสอบไฟล์เอกสาร
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
    const ALLOWED_DOC_EXT = [".pdf", ".jpg", ".jpeg", ".png"];

    // (REGD-16) ค่าคงที่สำหรับการตรวจสอบไฟล์รูปภาพ
    const MAX_IMAGE_SIZE_MB = 5;
    const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

    // 🆕 ย้าย RoomTypeModal ออกมาข้างนอก (ก่อน export default)
    const RoomTypeModal = ({ 
        isOpen,
        onClose,
        editingId,
        roomTypeName,
        onRoomTypeNameChange,
        roomTypeDesc,
        onRoomTypeDescChange,
        maxOccupancy,
        onMaxOccupancyChange,
        rentPerMonth,
        onRentPerMonthChange,
        rentPerDay,
        onRentPerDayChange,
        depositAmount,
        onDepositAmountChange,
        roomImages,
        onImageChange,
        onImageRemove,
        onImageView,
        selectedFacilities,
        onToggleFacility,
        facilities,
        errors,
        onSave,
        ALLOWED_IMAGE_TYPES,
    }: any) => {
        if (!isOpen) return null;
        
        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <div 
                    className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingId ? "แก้ไขประเภทห้อง" : "เพิ่มประเภทห้องใหม่"}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* ชื่อประเภทห้อง */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    ชื่อประเภทห้อง <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={roomTypeName}
                                    onChange={(e) => onRoomTypeNameChange(e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.roomTypeName ? "ring-red-500" : "focus:ring-purple-500"
                                    }`}
                                    placeholder="เช่น ห้องเดี่ยว, ห้องคู่"
                                />
                                {errors.roomTypeName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.roomTypeName}</p>
                                )}
                            </div>

                            {/* คำอธิบาย */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    คำอธิบายประเภทห้อง
                                </label>
                                <textarea
                                    value={roomTypeDesc}
                                    onChange={(e) => onRoomTypeDescChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="อธิบายรายละเอียดห้อง"
                                    rows={3}
                                />
                            </div>

                            {/* จำนวนผู้เข้าพักสูงสุด */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    จำนวนผู้เข้าพักสูงสุด <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={maxOccupancy}
                                    onChange={(e) => onMaxOccupancyChange(e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.maxOccupancy ? "ring-red-500" : "focus:ring-purple-500"
                                    }`}
                                    placeholder="เช่น 2"
                                />
                                {errors.maxOccupancy && (
                                    <p className="text-red-500 text-xs mt-1">{errors.maxOccupancy}</p>
                                )}
                            </div>

                            {/* ค่าเช่าต่อเดือน */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    ค่าเช่าต่อเดือน (บาท) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={rentPerMonth}
                                    onChange={(e) => onRentPerMonthChange(e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.rentPerMonth ? "ring-red-500" : "focus:ring-purple-500"
                                    }`}
                                    placeholder="เช่น 3500"
                                />
                                {errors.rentPerMonth && (
                                    <p className="text-red-500 text-xs mt-1">{errors.rentPerMonth}</p>
                                )}
                            </div>

                            {/* ค่าเช่าต่อวัน */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    ค่าเช่าต่อวัน (บาท) - ถ้ามี
                                </label>
                                <input
                                    type="text"
                                    value={rentPerDay}
                                    onChange={(e) => onRentPerDayChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="เช่น 200"
                                />
                            </div>

                            {/* เงินประกัน */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    เงินประกัน (บาท) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={depositAmount}
                                    onChange={(e) => onDepositAmountChange(e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.depositAmount ? "ring-red-500" : "focus:ring-purple-500"
                                    }`}
                                    placeholder="เช่น 3500"
                                />
                                {errors.depositAmount && (
                                    <p className="text-red-500 text-xs mt-1">{errors.depositAmount}</p>
                                )}
                            </div>

                            {/* รูปภาพประเภทห้อง */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    รูปภาพประเภทห้อง
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="file"
                                        id="modal-room-images"
                                        className="hidden"
                                        accept={ALLOWED_IMAGE_TYPES.join(",")}
                                        multiple
                                        onChange={onImageChange}
                                    />
                                    <label
                                        htmlFor="modal-room-images"
                                        className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg font-medium transition cursor-pointer h-fit"
                                    >
                                        insert
                                    </label>

                                    <div className="flex-1 space-y-2">
                                        {roomImages.length === 0 && (
                                            <div className="flex-1 px-4 py-3 bg-gray-100 rounded-lg flex items-center">
                                                <span className="text-gray-400">เลือกรูปภาพ</span>
                                            </div>
                                        )}
                                        {roomImages.map((file: File, index: number) => (
                                            <div
                                                key={index}
                                                className="flex-1 px-4 py-3 bg-gray-100 rounded-lg flex items-center justify-between"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => onImageView(file)}
                                                    className="text-blue-600 hover:text-blue-700 underline truncate flex-1 text-left"
                                                    title={file.name}
                                                >
                                                    {file.name}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onImageRemove(file.name)}
                                                    className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* สิ่งอำนวยความสะดวก */}
                            <div>
                                <label className="block text-sm font-medium mb-3 text-gray-700">
                                    สิ่งอำนวยความสะดวก
                                </label>
                                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border rounded-lg">
                                    {facilities.map((facility: string) => (
                                        <label
                                            key={facility}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedFacilities.includes(facility)}
                                                onChange={() => onToggleFacility(facility)}
                                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                            <span className="text-sm text-gray-700">{facility}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={onSave}
                                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                            >
                                {editingId ? "บันทึกการแก้ไข" : "เพิ่มประเภทห้อง"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default function RegisterDormOwnerFormPage() {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [currentStep, setCurrentStep] = useState<Step>("account");

    // --- 1. Account Data ---
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [idCard, setIdCard] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // --- 2. Document Data ---
    const [documentFiles, setDocumentFiles] = useState<
        Record<string, { file: File | null; name: string }>
    >({
        license: { file: null, name: "" },
        copyReceipt: { file: null, name: "" },
        authorization: { file: null, name: "" },
        idCardCopy: { file: null, name: "" },
        utilityBill: { file: null, name: "" },
        buildingPermit: { file: null, name: "" },
    });

    // --- 3. Location Data ---
    const [dormName, setDormName] = useState("");
    const [district, setDistrict] = useState("");
    const [province, setProvince] = useState("");
    const [subDistrict, setSubDistrict] = useState("");
    const [alley, setAlley] = useState("");
    const [road, setRoad] = useState("");
    const [provinceName, setProvinceName] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [coordinates, setCoordinates] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const mapInstanceRef = useRef<any>(null);
    const markerInstanceRef = useRef<any>(null);
    const searchBoxRef = useRef<any>(null);

    // --- 4. Details Data ---
    // const [dormTitle, setDormTitle] = useState("");
    // const [totalRooms, setTotalRooms] = useState("");
    // const [roomTypes, setRoomTypes] = useState("");
    // const [rentalPrice, setRentalPrice] = useState("");
    // const [dormImages, setDormImages] = useState<File[]>([]);
    // const [floorPlan, setFloorPlan] = useState<File | null>(null);
    // const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [dormTitle, setDormTitle] = useState("");
    const [dormDescription, setDormDescription] = useState(""); 
    const [waterCost, setWaterCost] = useState(""); 
    const [powerCost, setPowerCost] = useState(""); 
    const [telDorm, setTelDorm] = useState(""); 
    const [lineId, setLineId] = useState(""); 
    //   แทนที่ totalRooms, roomTypes, rentalPrice เดิม ด้วย Array
    const [roomTypesList, setRoomTypesList] = useState<RoomType[]>([]); 
    
    const [dormImages, setDormImages] = useState<File[]>([]);
    const [floorPlan, setFloorPlan] = useState<File | null>(null);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

    //   State สำหรับ Modal เพิ่มประเภทห้อง
    const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
    const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null); // null = เพิ่มใหม่, มีค่า = แก้ไข

    //   State สำหรับฟอร์มใน Modal
    const [modalRoomTypeName, setModalRoomTypeName] = useState("");
    const [modalRoomTypeDesc, setModalRoomTypeDesc] = useState("");
    const [modalMaxOccupancy, setModalMaxOccupancy] = useState("");
    const [modalRentPerMonth, setModalRentPerMonth] = useState("");
    const [modalRentPerDay, setModalRentPerDay] = useState("");
    const [modalDepositAmount, setModalDepositAmount] = useState("");
    const [modalErrors, setModalErrors] = useState<ErrorState>({});
    const [modalRoomImages, setModalRoomImages] = useState<File[]>([]);
    const [modalSelectedFacilities, setModalSelectedFacilities] = useState<string[]>([]);

    // --- 5. Payment Data ---
    const [selectedPlan, setSelectedPlan] = useState<"free" | "basic" | "premium" | null>(
        null
    );
    // (FIX 1) แก้ไข State ให้รองรับ 'bank' (บัตรบัญชี) เพิ่มเติม
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        "bank" | "credit" | "qr" | null
    >(null);

    // --- UI & Error State ---
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const [errors, setErrors] = useState<ErrorState>({});
    const [docErrors, setDocErrors] = useState<ErrorState>({});
    const [locErrors, setLocErrors] = useState<ErrorState>({});
    const [detailsErrors, setDetailsErrors] = useState<ErrorState>({});

    /**
     * (REGD-06, REGD-08)
     * จัดการการเลือกไฟล์เอกสาร (เพิ่มการตรวจสอบ Type/Size)
     */
    const handleFileChange = (
        key: string,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        const inputEl = event.target;

        setDocErrors((prev) => ({ ...prev, [key]: "" }));

        if (!file) {
        handleFileRemove(key);
        inputEl.value = ""; // (FIX) เคลียร์ input ด้วย
        return;
        }

        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
        if (
        !ALLOWED_DOC_EXT.includes(fileExtension) ||
        !ALLOWED_DOC_TYPES.includes(file.type)
        ) {
        setDocErrors((prev) => ({
            ...prev,
            [key]: "ชนิดไฟล์ไม่รองรับ (ต้องเป็น .pdf, .jpg, .png)",
        }));
        inputEl.value = "";
        handleFileRemove(key);
        return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
        setDocErrors((prev) => ({
            ...prev,
            [key]: `ขนาดไฟล์เกินกำหนด (สูงสุด ${MAX_FILE_SIZE_MB} MB)`,
        }));
        inputEl.value = "";
        handleFileRemove(key);
        return;
        }

        setDocumentFiles((prev) => ({
        ...prev,
        [key]: { file, name: file.name },
        }));
        inputEl.value = ""; // (FIX) เคลียร์ input หลังสำเร็จ
    };

    /**
     * (REGD-08)
     * จัดการการลบไฟล์เอกสาร
     */
    const handleFileRemove = (key: string) => {
        setDocumentFiles((prev) => ({
        ...prev,
        [key]: { file: null, name: "" },
        }));
        setDocErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
        });
    };

    /**
     * ฟังก์ชันสำหรับกดดูไฟล์เอกสาร (ใช้กับเอกสาร)
     */
    const handleFileView = (key: string) => {
        const docFile = documentFiles[key];
        if (docFile.file) {
        const url = URL.createObjectURL(docFile.file);
        window.open(url, "_blank");
        }
    };

    /**
     * (REGD-16)
     * จัดการอัปโหลดรูปหอพัก (หลายรูป)
     */
    const handleDormImagesChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(event.target.files || []);
        let validFiles: File[] = [];
        let errorMsg = "";

        setDetailsErrors((prev) => ({ ...prev, dormImages: "" }));

        if (files.length === 0) {
        return; // ผู้ใช้กดยกเลิก ไม่ต้องทำอะไร
        }

        for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            errorMsg = "ชนิดไฟล์ไม่รองรับ (ต้องเป็น .jpg, .png)";
            break;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            errorMsg = `ขนาดไฟล์เกิน ${MAX_IMAGE_SIZE_MB} MB`;
            break;
        }
        validFiles.push(file);
        }

        if (errorMsg) {
        setDetailsErrors((prev) => ({ ...prev, dormImages: errorMsg }));
        event.target.value = ""; // เคลียร์ input
        } else {
        // (FIX 2) ใช้ ...prev เพื่อเก็บรูปเก่าไว้ด้วยหากผู้ใช้กดอัปโหลดเพิ่ม
        setDormImages((prev) => [...prev, ...validFiles]);
        event.target.value = ""; // เคลียร์ input field เพื่อให้เลือกไฟล์ซ้ำได้
        }
    };

    /**
     * (FIX 2)
     * ฟังก์ชันสำหรับกดดูรูปหอพัก
     */
    const handleDormImageView = (file: File) => {
        const url = URL.createObjectURL(file);
        window.open(url, "_blank");
    };

    /**
     * (FIX 2)
     * ฟังก์ชันสำหรับลบรูปหอพัก (จาก Array)
     */
    const handleDormImageRemove = (fileName: string) => {
        setDormImages((prev) => prev.filter((file) => file.name !== fileName));
    };

    /**
     * (REGD-16)
     * จัดการอัปโหลดแปลนห้อง
     */
    const handleFloorPlanChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        setDetailsErrors((prev) => ({ ...prev, floorPlan: "" }));

        if (!file) {
        setFloorPlan(null);
        event.target.value = ""; // เคลียร์ input
        return;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setDetailsErrors((prev) => ({
            ...prev,
            floorPlan: "ชนิดไฟล์ไม่รองรับ (ต้องเป็น .jpg, .png)",
        }));
        event.target.value = "";
        setFloorPlan(null);
        return;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setDetailsErrors((prev) => ({
            ...prev,
            floorPlan: `ขนาดไฟล์เกิน ${MAX_IMAGE_SIZE_MB} MB`,
        }));
        event.target.value = "";
        setFloorPlan(null);
        return;
        }

        setFloorPlan(file);
        event.target.value = ""; // เคลียร์ input field
    };

    /**
     * (FIX 2)
     * ฟังก์ชันสำหรับกดดูแปลนห้อง
     */
    const handleFloorPlanView = () => {
        if (floorPlan) {
        const url = URL.createObjectURL(floorPlan);
        window.open(url, "_blank");
        }
    };

    /**
     * (FIX 2)
     * ฟังก์ชันสำหรับลบแปลนห้อง
     */
    const handleFloorPlanRemove = () => {
        setFloorPlan(null);
    };

    /**
     * (REGD-17)
     * จัดการการเลือกสิ่งอำนวยความสะดวก
     */
    const toggleFacility = (facility: string) => {
        setSelectedFacilities((prev) =>
        prev.includes(facility)
            ? prev.filter((f) => f !== facility)
            : [...prev, facility]
        );
        if (detailsErrors.facilities) {
        setDetailsErrors((prev) => ({ ...prev, facilities: "" }));
        }
    };

    // --- (ส่วนของ Google Maps - ไม่มีการแก้ไข) ---
    useEffect(() => {
        if (currentStep === "location" && !window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAV8qhrif05CaOVoYBZQC4WOdA4FAcxx84&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setMapLoaded(true);
        };
        document.head.appendChild(script);
        } else if (currentStep === "location" && window.google) {
        setMapLoaded(true);
        }
    }, [currentStep]);

    useEffect(() => {
        if (mapLoaded && currentStep === "location") {
        if (mapInstanceRef.current) {
            mapInstanceRef.current = null;
            markerInstanceRef.current = null;
        }

        setTimeout(() => {
            const mapElement = document.getElementById("google-map");
            if (!mapElement || !window.google) return;

            const defaultLocation = { lat: 13.7563, lng: 100.5018 }; // Bangkok

            const map = new window.google.maps.Map(mapElement, {
            center: coordinates || defaultLocation,
            zoom: coordinates ? 15 : 6,
            });

            mapInstanceRef.current = map;

            const input = document.getElementById(
            "map-search-input"
            ) as HTMLInputElement;
            if (input) {
            const searchBox = new window.google.maps.places.SearchBox(input);
            searchBoxRef.current = searchBox;

            map.addListener("bounds_changed", () => {
                searchBox.setBounds(map.getBounds());
            });

            searchBox.addListener("places_changed", () => {
                const places = searchBox.getPlaces();
                if (places.length === 0) return;
                const place = places[0];
                if (!place.geometry || !place.geometry.location) return;

                const newCoords = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                };
                setCoordinates(newCoords);
                setLocErrors((prev) => ({ ...prev, coordinates: "" }));

                if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
                } else {
                map.setCenter(place.geometry.location);
                map.setZoom(15);
                }

                if (markerInstanceRef.current) {
                markerInstanceRef.current.setPosition(newCoords);
                } else {
                const marker = new window.google.maps.Marker({
                    position: newCoords,
                    map: map,
                    draggable: true,
                });
                markerInstanceRef.current = marker;
                marker.addListener("dragend", () => {
                    const pos = marker.getPosition();
                    if (pos) {
                    setCoordinates({ lat: pos.lat(), lng: pos.lng() });
                    setLocErrors((prev) => ({ ...prev, coordinates: "" }));
                    }
                });
                }
            });
            }

            if (coordinates) {
            const marker = new window.google.maps.Marker({
                position: coordinates,
                map: map,
                draggable: true,
            });
            markerInstanceRef.current = marker;

            marker.addListener("dragend", () => {
                const pos = marker.getPosition();
                if (pos) {
                setCoordinates({ lat: pos.lat(), lng: pos.lng() });
                setLocErrors((prev) => ({ ...prev, coordinates: "" }));
                }
            });
            }

            map.addListener("click", (e: any) => {
            const latLng = e.latLng;
            if (latLng) {
                const newCoords = { lat: latLng.lat(), lng: latLng.lng() };
                setCoordinates(newCoords);
                setLocErrors((prev) => ({ ...prev, coordinates: "" }));

                if (markerInstanceRef.current) {
                markerInstanceRef.current.setPosition(newCoords);
                } else {
                const marker = new window.google.maps.Marker({
                    position: newCoords,
                    map: map,
                    draggable: true,
                });
                markerInstanceRef.current = marker;

                marker.addListener("dragend", () => {
                    const pos = marker.getPosition();
                    if (pos) {
                    setCoordinates({ lat: pos.lat(), lng: pos.lng() });
                    }
                });
                }
            }
            });
        }, 100);
        }
    }, [mapLoaded, currentStep]);

    useEffect(() => {
        if (markerInstanceRef.current && coordinates) {
        markerInstanceRef.current.setPosition(coordinates);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo(coordinates);
        }
        }
    }, [coordinates]);

    // --- (ส่วน StepIcon และ MessageToast - ไม่มีการแก้ไข) ---
    const steps: { id: Step; label: string }[] = [
        { id: "account", label: "Account" },
        { id: "document", label: "Dormitory Document" },
        { id: "location", label: "Dorm Location" },
        { id: "details", label: "Dorm Detail&Facilities" },
        { id: "payment", label: "Subscription Payment" },
    ];
    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

    const StepIcon = ({ step }: { step: Step }) => {
        switch (step) {
        case "account":
            return (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
            );
        case "document":
            return (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
            );
        case "location":
            return (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
            );
        case "details":
            return (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
            </svg>
            );
        case "payment":
            return (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            );
        default:
            return null;
        }
    };

    const MessageToast = () => {
        if (!errorMessage) return null;
        return (
        <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-red-600 text-white rounded-lg shadow-xl"
            role="alert"
        >
            <div className="flex items-center">
            <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span>{errorMessage}</span>
            <button
                onClick={() => setErrorMessage("")}
                className="ml-4 font-bold text-lg"
            >
                &times;
            </button>
            </div>
        </div>
        );
    };
    // --- (จบส่วน StepIcon และ MessageToast) ---

    // --- (Validation Functions - ไม่มีการแก้ไข) ---
    const validateAccount = () => {
        const newErrors: ErrorState = {};
        if (!firstName) newErrors.firstName = "กรุณากรอกชื่อ";
        if (!lastName) newErrors.lastName = "กรุณากรอกนามสกุล";
        if (!idCard) newErrors.idCard = "กรุณากรอกเลขบัตรประชาชน";
        else if (idCard.length !== 13 || !/^\d+$/.test(idCard)) {
        newErrors.idCard = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
        }
        if (!phoneNumber) newErrors.phoneNumber = "กรุณากรอกเบอร์โทรศัพท์";
        else if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
        newErrors.phoneNumber = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก";
        }
        if (!email) newErrors.email = "กรุณากรอกอีเมล";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        if (!password) newErrors.password = "กรุณากรอกรหัสผ่าน";
        else if (password.length < 8) {
        newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        }
        if (!confirmPassword) newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
        else if (password !== confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
        }
        return newErrors;
    };
    const validateDocuments = () => {
        const newErrors: ErrorState = {};
        const requiredDocs = [
        "license",
        "copyReceipt",
        "idCardCopy",
        "utilityBill",
        ];
        for (const key of requiredDocs) {
        if (!documentFiles[key].file) {
            newErrors[key] = "กรุณาอัปโหลดเอกสารนี้";
        }
        }
        return newErrors;
    };
    const validateLocation = () => {
        const newErrors: ErrorState = {};
        if (!dormName) newErrors.dormName = "กรุณากรอกบ้านเลขที่";
        if (!district) newErrors.district = "กรุณากรอกอำเภอ";
        if (!subDistrict) newErrors.subDistrict = "กรุณากรอกตำบน";
        if (!provinceName) newErrors.provinceName = "กรุณากรอกจังหวัด";
        if (!postalCode) newErrors.postalCode = "กรุณากรอกรหัสไปรษณีย์";
        else if (postalCode.length !== 5 || !/^\d+$/.test(postalCode)) {
        newErrors.postalCode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
        }
        if (!coordinates) {
        newErrors.coordinates = "กรุณาปักหมุดตำแหน่งบนแผนที่";
        }
        return newErrors;
    };
    const validateDetails = () => {
        const newErrors: ErrorState = {};
        if (!dormTitle) newErrors.dormTitle = "กรุณากรอกชื่อหอพัก";
        
        if (roomTypesList.length === 0) {
            newErrors.roomTypes = "กรุณาเพิ่มประเภทห้องอย่างน้อย 1 รายการ";
        }
        
        if (dormImages.length === 0) {
            if (
                !detailsErrors.dormImages?.includes("ชนิด") &&
                !detailsErrors.dormImages?.includes("ขนาด")
            ) {
                newErrors.dormImages = "กรุณาอัปโหลดรูปหอพักอย่างน้อย 1 รูป";
            }
        }
        // 🗑️ ลบการ validate selectedFacilities ออก
        return newErrors;
    };
    // --- (จบส่วน Validation Functions) ---

    /**
     * (handleNext - ปรับปรุงเล็กน้อย)
     * จัดการการกดปุ่ม "Next"
     */
    const handleNext = async () => {
        setErrorMessage("");
        setIsProcessing(true);

        try {
        if (currentStep === "account") {
            const newErrors = validateAccount();
            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) {
            setErrorMessage("กรุณากรอกข้อมูลในช่องสีแดงให้ถูกต้อง");
            setIsProcessing(false);
            return;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
            const duplicateErrors: ErrorState = {};
            if (email === "existing.owner@gmail.com") {
            duplicateErrors.email = "อีเมลนี้ถูกใช้แล้ว";
            }
            if (phoneNumber === "0912345678" && email !== "owner.test@gmail.com") {
            duplicateErrors.phoneNumber = "เบอร์โทรศัพท์นี้ถูกใช้แล้ว";
            }
            if (Object.keys(duplicateErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...duplicateErrors }));
            setErrorMessage("ข้อมูลซ้ำในระบบ กรุณาตรวจสอบช่องสีแดง");
            setIsProcessing(false);
            return;
            }

            console.log("Account data:", {
            firstName,
            lastName,
            idCard,
            phoneNumber,
            email,
            password,
            });
            setCurrentStep("document");
            setIsProcessing(false);
        } else if (currentStep === "document") {
            const missingRequiredErrors = validateDocuments();
            const requiredDocs = [
                "license",
                "copyReceipt",
                "idCardCopy",
                "utilityBill",
            ];
            let requiredFileHasError = false;
            const allRequiredErrors: ErrorState = { ...missingRequiredErrors };

            for (const key of requiredDocs) {
                if (docErrors[key]) {
                    allRequiredErrors[key] = docErrors[key];
                    requiredFileHasError = true;
                }
            }

            setDocErrors({ ...docErrors, ...allRequiredErrors });

            if (Object.keys(allRequiredErrors).length > 0) {
                setErrorMessage(
                    "กรุณาอัปโหลดเอกสารบังคับให้ครบถ้วน และแก้ไขไฟล์ที่มีปัญหา"
                );
                setIsProcessing(false);
                return;
            }

            setCurrentStep("location");
            setIsProcessing(false);
        } else if (currentStep === "location") {
            const newErrors = validateLocation();
            setLocErrors(newErrors);
            if (Object.keys(newErrors).length > 0) {
            setErrorMessage("กรุณากรอกข้อมูลที่อยู่และปักหมุดให้ครบถ้วน");
            setIsProcessing(false);
            return;
            }

            console.log("Location data:", {
            dormName,
            district,
            province,
            subDistrict,
            alley,
            road,
            provinceName,
            postalCode,
            coordinates,
            });
            setCurrentStep("details");
            setIsProcessing(false);
        } else if (currentStep === "details") {
            const newErrors = validateDetails();
            const fileErrors: ErrorState = {};
            
            if (detailsErrors.dormImages && detailsErrors.dormImages.length > 0) {
                fileErrors.dormImages = detailsErrors.dormImages;
            }
            if (detailsErrors.floorPlan && detailsErrors.floorPlan.length > 0) {
                fileErrors.floorPlan = detailsErrors.floorPlan;
            }

            const allErrors = { ...fileErrors, ...newErrors };
            setDetailsErrors(allErrors);

            const hasErrors = Object.values(allErrors).some(
                (msg) => msg && msg.length > 0
            );

            if (hasErrors) {
                setErrorMessage(
                    "กรุณากรอกรายละเอียดหอพักให้ครบถ้วน และตรวจสอบไฟล์รูปภาพ"
                );
                setIsProcessing(false);
                return;
            }

            console.log("Details data:", {
                dormTitle,
                dormDescription,
                waterCost,
                powerCost,
                telDorm,
                lineId,
                roomTypesList,
                dormImages,
                floorPlan,
                selectedFacilities,
            });
            setCurrentStep("payment");
            setIsProcessing(false);
        } else if (currentStep === "payment") {
            if (!selectedPlan) {
                setErrorMessage("กรุณาเลือกแผนการใช้งาน");
                setIsProcessing(false);
                return;
            }
            if (!selectedPaymentMethod) {
                setErrorMessage("กรุณาเลือกวิธีการชำระเงิน");
                setIsProcessing(false);
                return;
            }

            console.log("Payment data:", { selectedPlan, selectedPaymentMethod });
            console.log("All form data:", {
                account: { firstName, lastName, idCard, phoneNumber, email },
                documents: documentFiles,
                location: {
                    dormName,
                    district,
                    province,
                    coordinates,
                    subDistrict,
                    alley,
                    road,
                details: {
                    dormTitle,
                    dormDescription,
                    waterCost,
                    powerCost,
                    telDorm,
                    lineId,
                    roomTypesList,
                    selectedFacilities,
                    dormImages,
                    floorPlan,
                },
                    dormImages,
                    floorPlan,
                },
                payment: { selectedPlan, selectedPaymentMethod },
            });

            setIsProcessing(false);
            // เปลี่ยนสถานะเป็น DormOwner และไปหน้า Dashboard
            if (auth) {
                auth.loginAsDormOwner();
                navigate('/dorm-owner-dashboard');
            }
        }
        } catch (error) {
        setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        setIsProcessing(false);
        }
    };

    /**
     * (handleBack - ไม่มีการแก้ไข)
     * จัดการการกดย้อนกลับ
     */
    const handleBack = () => {
        if (currentStep === "document") setCurrentStep("account");
        else if (currentStep === "location") setCurrentStep("document");
        else if (currentStep === "details") setCurrentStep("location");
        else if (currentStep === "payment") setCurrentStep("details");
    };

    /**
     *เปิด Modal เพื่อเพิ่มประเภทห้องใหม่
     */
    const openAddRoomTypeModal = () => {
        setEditingRoomTypeId(null);
        setModalRoomTypeName("");
        setModalRoomTypeDesc("");
        setModalMaxOccupancy("");
        setModalRentPerMonth("");
        setModalRentPerDay("");
        setModalDepositAmount("");
        setModalRoomImages([]);                    
        setModalSelectedFacilities([]);            
        setModalErrors({});
        setIsRoomTypeModalOpen(true);
    };

    /**
     * เปิด Modal เพื่อแก้ไขประเภทห้อง
     */
    const openEditRoomTypeModal = (roomType: RoomType) => {
        setEditingRoomTypeId(roomType.id);
        setModalRoomTypeName(roomType.roomTypeName);
        setModalRoomTypeDesc(roomType.roomTypeDesc);
        setModalMaxOccupancy(roomType.maxOccupancy);
        setModalRentPerMonth(roomType.rentPerMonth);
        setModalRentPerDay(roomType.rentPerDay);
        setModalDepositAmount(roomType.depositAmount);
        setModalRoomImages(roomType.images);              
        setModalSelectedFacilities(roomType.facilities);  
        setModalErrors({});
        setIsRoomTypeModalOpen(true);
    };

    /**
     * 🆕 ปิด Modal
     */
    const closeRoomTypeModal = () => {
        setIsRoomTypeModalOpen(false);
        setEditingRoomTypeId(null);
        setModalErrors({});
    };

    /**
     * 🆕 Validate ฟอร์มใน Modal
     */
    const validateRoomTypeModal = () => {
        const newErrors: ErrorState = {};
        if (!modalRoomTypeName) newErrors.roomTypeName = "กรุณากรอกชื่อประเภทห้อง";
        if (!modalMaxOccupancy) newErrors.maxOccupancy = "กรุณากรอกจำนวนผู้เข้าพักสูงสุด";
        else if (isNaN(Number(modalMaxOccupancy)) || Number(modalMaxOccupancy) <= 0) {
            newErrors.maxOccupancy = "จำนวนผู้เข้าพักต้องเป็นตัวเลขและมากกว่า 0";
        }
        if (!modalRentPerMonth) newErrors.rentPerMonth = "กรุณากรอกค่าเช่าต่อเดือน";
        else if (isNaN(Number(modalRentPerMonth.replace(/,/g, "")))) {
            newErrors.rentPerMonth = "ค่าเช่าต้องเป็นตัวเลข";
        }
        if (!modalDepositAmount) newErrors.depositAmount = "กรุณากรอกเงินประกัน";
        else if (isNaN(Number(modalDepositAmount.replace(/,/g, "")))) {
            newErrors.depositAmount = "เงินประกันต้องเป็นตัวเลข";
        }
        return newErrors;
    };

    /**
     * 🆕 บันทึกประเภทห้อง (เพิ่มใหม่หรือแก้ไข)
     */
    const saveRoomType = () => {
        const newErrors = validateRoomTypeModal();
        setModalErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const roomType: RoomType = {
            id: editingRoomTypeId || Date.now().toString(),
            roomTypeName: modalRoomTypeName,
            roomTypeDesc: modalRoomTypeDesc,
            maxOccupancy: modalMaxOccupancy,
            rentPerMonth: modalRentPerMonth,
            rentPerDay: modalRentPerDay,
            depositAmount: modalDepositAmount,
            images: modalRoomImages,                     
            facilities: modalSelectedFacilities,         
        };

        if (editingRoomTypeId) {
            setRoomTypesList((prev) =>
                prev.map((rt) => (rt.id === editingRoomTypeId ? roomType : rt))
            );
        } else {
            setRoomTypesList((prev) => [...prev, roomType]);
        }

        closeRoomTypeModal();
    };

    /**
     * ลบประเภทห้อง
     */
    const deleteRoomType = (id: string) => {
        if (window.confirm("ต้องการลบประเภทห้องนี้หรือไม่?")) {
            setRoomTypesList((prev) => prev.filter((rt) => rt.id !== id));
        }
    };

    /**
     * จัดการอัปโหลดรูปประเภทห้องใน Modal
     */
    const handleModalRoomImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        let validFiles: File[] = [];
        let errorMsg = "";

        if (files.length === 0) return;

        for (const file of files) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                errorMsg = "ชนิดไฟล์ไม่รองรับ (ต้องเป็น .jpg, .png)";
                break;
            }
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                errorMsg = `ขนาดไฟล์เกิน ${MAX_IMAGE_SIZE_MB} MB`;
                break;
            }
            validFiles.push(file);
        }

        if (errorMsg) {
            alert(errorMsg);
            event.target.value = "";
        } else {
            setModalRoomImages((prev) => [...prev, ...validFiles]);
            event.target.value = "";
        }
    };

    /**
     * ลบรูปภาพประเภทห้องใน Modal
     */
    const handleModalRoomImageRemove = (fileName: string) => {
        setModalRoomImages((prev) => prev.filter((file) => file.name !== fileName));
    };

    /**
     * กดดูรูปภาพประเภทห้องใน Modal
     */
    const handleModalRoomImageView = (file: File) => {
        const url = URL.createObjectURL(file);
        window.open(url, "_blank");
    };

    /**
     * Toggle Facility ใน Modal
     */
    const toggleModalFacility = (facility: string) => {
        setModalSelectedFacilities((prev) =>
            prev.includes(facility)
                ? prev.filter((f) => f !== facility)
                : [...prev, facility]
        );
    };

    const facilities = [
        'WiFi', 'Air Conditioning', 'Parking', 'Security Camera', 
        'Laundry Service', 'Fitness Center', 'Swimming Pool', '24/7 Security Guard', 
        'Elevator', 'Key Card Access', 'Common Area', 'Refrigerator', 'Water Heater', 
        'Microwave', 'Study Room', 'Vending Machine', 'Bike Parking', 'Pet Friendly', 
        'Convenience Store', 'Restaurant/Cafe'

    ];



    // --- (เริ่มส่วน JSX) ---
    return (
        <div className="min-h-screen bg-gray-50 flex">
        <MessageToast />
        <div>
            <RoomTypeModal
                isOpen={isRoomTypeModalOpen}
                onClose={closeRoomTypeModal}
                editingId={editingRoomTypeId}
                roomTypeName={modalRoomTypeName}
                onRoomTypeNameChange={setModalRoomTypeName}
                roomTypeDesc={modalRoomTypeDesc}
                onRoomTypeDescChange={setModalRoomTypeDesc}
                maxOccupancy={modalMaxOccupancy}
                onMaxOccupancyChange={setModalMaxOccupancy}
                rentPerMonth={modalRentPerMonth}
                onRentPerMonthChange={setModalRentPerMonth}
                rentPerDay={modalRentPerDay}
                onRentPerDayChange={setModalRentPerDay}
                depositAmount={modalDepositAmount}
                onDepositAmountChange={setModalDepositAmount}
                roomImages={modalRoomImages}
                onImageChange={handleModalRoomImagesChange}
                onImageRemove={handleModalRoomImageRemove}
                onImageView={handleModalRoomImageView}
                selectedFacilities={modalSelectedFacilities}
                onToggleFacility={toggleModalFacility}
                facilities={facilities}
                errors={modalErrors}
                onSave={saveRoomType}
                ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
            />
        </div>

        {/* --- Progress Stepper (Sidebar) --- */}
        <div className="w-64 bg-gray-50 flex flex-col justify-center px-6 py-16 ml-[100px]">
            <div className="space-y-8">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    index < currentStepIndex
                        ? "bg-blue-500 text-white border-4 border-blue-500"
                        : index === currentStepIndex
                        ? "bg-white text-blue-600 border-4 border-blue-500"
                        : "bg-white text-gray-400 border-4 border-gray-300"
                    }`}
                >
                    <StepIcon step={step.id} />
                </div>
                <div className="flex-1">
                    <p
                    className={`text-xs font-medium leading-tight ${
                        index === currentStepIndex
                        ? "text-blue-600 font-semibold"
                        : index < currentStepIndex
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                    >
                    {step.label}
                    </p>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 overflow-auto p-8 sm:p-12">
            <div className="max-w-4xl mx-auto">
            {/* === Step 1: Account (Validation UI) === */}
            {currentStep === "account" && (
                <div>
                <h1 className="text-4xl font-bold mb-8">Create Dorm Account</h1>
                <div className="space-y-6 max-w-2xl">
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        ชื่อ
                    </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName)
                            setErrors((prev) => ({ ...prev, firstName: "" }));
                        }}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.firstName
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="ชื่อจริงของคุณ"
                    />
                    {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">
                        {errors.firstName}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        นามสกุล
                    </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.lastName ? "ring-red-500" : "focus:ring-purple-500"
                        }`}
                        placeholder="นามสกุลของคุณ"
                    />
                    {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">
                        {errors.lastName}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        เลขประจำตัวประชาชน
                    </label>
                    <input
                        type="text"
                        value={idCard}
                        onChange={(e) => setIdCard(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.idCard ? "ring-red-500" : "focus:ring-purple-500"
                        }`}
                        placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                        maxLength={13}
                    />
                    {errors.idCard && (
                        <p className="text-red-500 text-xs mt-1">{errors.idCard}</p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        เบอร์โทรศัพท์
                    </label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.phoneNumber
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="0XX-XXX-XXXX"
                        maxLength={10}
                    />
                    {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">
                        {errors.phoneNumber}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email ? "ring-red-500" : "focus:ring-purple-500"
                        }`}
                        placeholder="your@email.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        Password
                    </label>
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 pr-12 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.password
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="••••••••"
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                        >
                        {showPassword ? (
                            <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                            </svg>
                        ) : (
                            <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                            </svg>
                        )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        Confirm password
                    </label>
                    <div className="relative">
                        <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 pr-12 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                            errors.confirmPassword
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="••••••••"
                        />
                        <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                        >
                        {showConfirmPassword ? (
                            <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                            </svg>
                        ) : (
                            <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                            </svg>
                        )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                        </p>
                    )}
                    </div>
                </div>
                </div>
            )}

            {/* === Step 2: Document (Validation UI) === */}
            {currentStep === "document" && (
                <div>
                <h1 className="text-4xl font-bold mb-8">
                    Insert Dormitory Document
                </h1>
                <div className="space-y-6 max-w-3xl">
                    {[
                    {
                        key: "license",
                        label: "ใบอนุญาตประกอบกิจการหอพัก",
                        required: true,
                    },
                    {
                        key: "copyReceipt",
                        label: "สำเนาโฉนดที่ดินหรือสัญญาเช่าที่ดิน",
                        required: true,
                    },
                    {
                        key: "authorization",
                        label: "หนังสือมอบอำนาจของเจ้าของกิจการ (ถ้ามี)",
                        required: false,
                    },
                    {
                        key: "idCardCopy",
                        label: "สำเนาบัตรประชาชนเจ้าของหอพัก",
                        required: true,
                    },
                    {
                        key: "utilityBill",
                        label:
                        "เอกสารรับรองกับกรมพัฒนาธุรกิจการค้า (เช่น ใบแจ้งหนี้ค่าไฟฟ้าล่าสุด)",
                        required: true,
                    },
                    {
                        key: "buildingPermit",
                        label: "หลักฐานใบอนุญาตก่อสร้าง หรือใบรับรองอาคาร (ถ้ามี)",
                        required: false,
                    },
                    ].map((doc) => (
                    <div key={doc.key}>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                        {doc.label}
                        {doc.required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                        </label>
                        <div className="flex gap-3">
                        <input
                            type="file"
                            id={`file-${doc.key}`}
                            className="hidden"
                            accept={ALLOWED_DOC_EXT.join(",")}
                            onChange={(e) => handleFileChange(doc.key, e)}
                        />
                        <label
                            htmlFor={`file-${doc.key}`}
                            className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg font-medium transition cursor-pointer"
                        >
                            insert
                        </label>
                        <div
                            className={`flex-1 px-4 py-3 bg-gray-100 rounded-lg flex items-center justify-between ${
                            docErrors[doc.key] ? "border-2 border-red-500" : ""
                            }`}
                        >
                            {documentFiles[doc.key].name ? (
                            <>
                                <button
                                type="button"
                                onClick={() => handleFileView(doc.key)}
                                className="text-blue-600 hover:text-blue-700 underline truncate flex-1 text-left"
                                >
                                {documentFiles[doc.key].name}
                                </button>
                                <button
                                type="button"
                                onClick={() => handleFileRemove(doc.key)}
                                className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                                >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                </button>
                            </>
                            ) : (
                            <span className="text-gray-400">ชื่อไฟล์</span>
                            )}
                        </div>
                        </div>
                        {docErrors[doc.key] && (
                        <p className="text-red-500 text-xs mt-1">
                            {docErrors[doc.key]}
                        </p>
                        )}
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* === Step 3: Location (Validation UI) === */}
            {currentStep === "location" && (
                <div>
                <h1 className="text-4xl font-bold mb-8">Select Dorm Location</h1>
                <div className="space-y-6 max-w-3xl">
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        บ้านเลขที่
                    </label>
                    <input
                        type="text"
                        value={dormName}
                        onChange={(e) => {
                        setDormName(e.target.value);
                        if (locErrors.dormName)
                            setLocErrors((prev) => ({ ...prev, dormName: "" }));
                        }}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        locErrors.dormName
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="เลขที่บ้าน/หอพัก"
                    />
                    {locErrors.dormName && (
                        <p className="text-red-500 text-xs mt-1">
                        {locErrors.dormName}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        อำเภอ
                    </label>
                    <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        locErrors.district
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="อำเภอ"
                    />
                    {locErrors.district && (
                        <p className="text-red-500 text-xs mt-1">
                        {locErrors.district}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        หมู่
                    </label>
                    <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="หมู่"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        ตำบล
                    </label>
                    <input
                        type="text"
                        value={subDistrict}
                        onChange={(e) => setSubDistrict(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        locErrors.subDistrict
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="ตำบล"
                    />
                    {locErrors.subDistrict && (
                        <p className="text-red-500 text-xs mt-1">
                        {locErrors.subDistrict}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        แขวง/ตำบล
                    </label>
                    <input
                        type="text"
                        value={alley}
                        onChange={(e) => setAlley(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="แขวง/ตำบล"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        เขต/อำเภอ
                    </label>
                    <input
                        type="text"
                        value={road}
                        onChange={(e) => setRoad(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="เขต/อำเภอ"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        จังหวัด
                    </label>
                    <input
                        type="text"
                        value={provinceName}
                        onChange={(e) => setProvinceName(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        locErrors.provinceName
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="จังหวัด"
                    />
                    {locErrors.provinceName && (
                        <p className="text-red-500 text-xs mt-1">
                        {locErrors.provinceName}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        รหัสไปรษณีย์
                    </label>
                    <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                        locErrors.postalCode
                            ? "ring-red-500"
                            : "focus:ring-purple-500"
                        }`}
                        placeholder="รหัสไปรษณีย์ 5 หลัก"
                        maxLength={5}
                    />
                    {locErrors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">
                        {locErrors.postalCode}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        ปักหมุดบนแผนที่
                        {coordinates && (
                        <span className="ml-2 text-xs text-green-600">
                            ✓ ปักหมุดแล้ว ({coordinates.lat.toFixed(6)},{" "}
                            {coordinates.lng.toFixed(6)})
                        </span>
                        )}
                    </label>
                    {locErrors.coordinates && (
                        <p className="text-red-500 text-sm mb-2">
                        {locErrors.coordinates}
                        </p>
                    )}
                    <div className="mb-3">
                        <input
                        id="map-search-input"
                        type="text"
                        placeholder="🔍 ค้นหาสถานที่ เช่น ชื่อหอพัก ถนน หรือชื่อสถานที่"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div
                        id="google-map"
                        className={`w-full h-96 bg-gray-200 rounded-lg border-2 ${
                        locErrors.coordinates
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        style={{ minHeight: "400px" }}
                    >
                        {!mapLoaded && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">กำลังโหลดแผนที่...</p>
                        </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 ค้นหาสถานที่ด้วยช่องค้นหาด้านบน
                        หรือคลิกบนแผนที่เพื่อปักหมุด หรือลากหมุดเพื่อปรับตำแหน่ง
                    </p>
                    </div>
                </div>
                </div>
            )}

            {/* === Step 4: Details (แก้ไขใหม่) === */}
            {currentStep === "details" && (
                <div>
                    <h1 className="text-4xl font-bold mb-8">Enter Dorm Detail & Facilities</h1>
                    <div className="space-y-6 max-w-3xl">
                        
                        {/* ชื่อหอพัก */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                ชื่อหอพัก
                            </label>
                            <input
                                type="text"
                                value={dormTitle}
                                onChange={(e) => {
                                    setDormTitle(e.target.value);
                                    if (detailsErrors.dormTitle)
                                        setDetailsErrors((prev) => ({ ...prev, dormTitle: "" }));
                                }}
                                className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                                    detailsErrors.dormTitle ? "ring-red-500" : "focus:ring-purple-500"
                                }`}
                                placeholder="ชื่อหอพัก"
                            />
                            {detailsErrors.dormTitle && (
                                <p className="text-red-500 text-xs mt-1">{detailsErrors.dormTitle}</p>
                            )}
                        </div>

                        {/* คำอธิบายหอพัก */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                คำอธิบายหอพัก
                            </label>
                            <textarea
                                value={dormDescription}
                                onChange={(e) => setDormDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="อธิบายรายละเอียดหอพัก"
                                rows={3}
                            />
                        </div>

                        {/* จำนวนผู้เข้าพักสูงสุด */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                จำนวนผู้เข้าพักสูงสุด
                            </label>
                            <input
                                type="text"
                                value={waterCost}
                                onChange={(e) => setWaterCost(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="เช่น 15"
                            />
                        </div>

                        
                        {/* Line ID (ไม่มีในภาพ แต่เก็บไว้) */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Line ID
                            </label>
                            <input
                                type="text"
                                value={lineId}
                                onChange={(e) => setLineId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Line ID (ถ้ามี)"
                            />
                        </div>


                        {/* ภาพถ่ายหอพัก */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                ภาพถ่ายหอพัก
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="file"
                                    id="dorm-images"
                                    className="hidden"
                                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                                    multiple
                                    onChange={handleDormImagesChange}
                                />
                                <label
                                    htmlFor="dorm-images"
                                    className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg font-medium transition cursor-pointer h-fit"
                                >
                                    insert
                                </label>

                                <div className="flex-1 space-y-2">
                                    {dormImages.length === 0 && (
                                        <div className="flex-1 px-4 py-3 bg-gray-100 rounded-lg flex items-center">
                                            <span className="text-gray-400">เลือกรูปภาพหอพัก</span>
                                        </div>
                                    )}
                                    {dormImages.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex-1 px-4 py-3 bg-gray-100 rounded-lg flex items-center justify-between"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleDormImageView(file)}
                                                className="text-blue-600 hover:text-blue-700 underline truncate flex-1 text-left"
                                                title={file.name}
                                            >
                                                {file.name}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDormImageRemove(file.name)}
                                                className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {detailsErrors.dormImages && (
                                <p className="text-red-500 text-xs mt-1">{detailsErrors.dormImages}</p>
                            )}
                        </div>


                        {/* 🆕 ส่วนแสดงรายการประเภทห้อง + ปุ่มเพิ่ม */}
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">ประเภทห้องพัก</h2>
                                <button
                                    type="button"
                                    onClick={openAddRoomTypeModal}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                                >
                                    + เพิ่มประเภทห้อง
                                </button>
                            </div>

                            {detailsErrors.roomTypes && (
                                <p className="text-red-500 text-sm mb-3">{detailsErrors.roomTypes}</p>
                            )}

                            {roomTypesList.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">ยังไม่มีประเภทห้อง กดปุ่ม "+ เพิ่มประเภทห้อง" เพื่อเพิ่ม</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {roomTypesList.map((roomType) => (
                                        <div
                                            key={roomType.id}
                                            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 transition"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-800">
                                                        {roomType.roomTypeName}
                                                    </h3>
                                                    {roomType.roomTypeDesc && (
                                                        <p className="text-sm text-gray-600 mt-1">{roomType.roomTypeDesc}</p>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">ผู้เข้าพักสูงสุด:</span>
                                                            <span className="ml-2 font-medium">{roomType.maxOccupancy} คน</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">ค่าเช่า/เดือน:</span>
                                                            <span className="ml-2 font-medium">{roomType.rentPerMonth} ฿</span>
                                                        </div>
                                                        {roomType.rentPerDay && (
                                                            <div>
                                                                <span className="text-gray-600">ค่าเช่า/วัน:</span>
                                                                <span className="ml-2 font-medium">{roomType.rentPerDay} ฿</span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-gray-600">เงินประกัน:</span>
                                                            <span className="ml-2 font-medium">{roomType.depositAmount} ฿</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-gray-600">รูปภาพ:</span>
                                                            <span className="ml-2 font-medium">{roomType.images.length} รูป</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-gray-600">สิ่งอำนวยความสะดวก:</span>
                                                            <span className="ml-2 font-medium">{roomType.facilities.join(", ") || "ไม่ระบุ"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditRoomTypeModal(roomType)}
                                                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    >
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteRoomType(roomType.id)}
                                                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                                                    >
                                                        ลบ
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

{/* === Step 5: Payment === */}
            {currentStep === "payment" && (
                <div>
                    <h1 className="text-4xl font-bold mb-4">Dorm Subscription</h1>
                    <p className="text-gray-600 mb-8 max-w-3xl">
                        Dormly จะช่วยให้ผู้เช่าหอพักของคุณใช้งานยืนในหน้าแนะนำและผลการค้นหา
                        เลือกแผนที่เหมาะกับคุณ แล้วเริ่มสร้างโปรไฟล์หอพักของคุณวันนี้!
                    </p>

                    {/* Choose Your Plan */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
                        <div className="space-y-4 max-w-3xl">
                            
                            {/* Free Plan */}
                            <div
                                onClick={() => {
                                    setSelectedPlan("free");
                                    // เมื่อเลือก Free Plan ให้เปลี่ยนสถานะเป็น DormOwner และไปหน้า Dashboard
                                    if (auth) {
                                        auth.loginAsDormOwner();
                                        navigate('/dorm-owner-dashboard');
                                    }
                                }}
                                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                                    selectedPlan === "free"
                                        ? "border-purple-500 bg-purple-50"
                                        : "border-gray-300 bg-gray-100 hover:border-gray-400"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedPlan === "free"
                                                    ? "border-purple-500"
                                                    : "border-gray-400"
                                            }`}
                                        >
                                            {selectedPlan === "free" && (
                                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">Free Plan</h3>
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    แนะนำสำหรับผู้เริ่มต้น
                                                </span>
                                            </div>
                                            <ul className="text-sm text-gray-700 mt-2 space-y-1">
                                                <li>• แสดงหอพักบน Dormly 7 วัน</li>
                                                <li>• รองรับรูปภาพสูงสุด 5 รูป</li>
                                                <li>• แก้ไขข้อมูลได้ 3 ครั้ง/สัปดาห์</li>
                                                <li>• ไม่มี Badge พิเศษ</li>
                                                <li className="text-xs text-gray-500">
                                                    เหมาะสำหรับผู้ที่ต้องการทดลองใช้งาน Dormly
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-green-600">ฟรี!</div>
                                        <div className="text-xs text-green-600 mt-1">คลิกเพื่อเริ่มใช้งาน</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Basic Plan */}
                            <div
                                onClick={() => setSelectedPlan("basic")}
                                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                                    selectedPlan === "basic"
                                        ? "border-purple-500 bg-purple-50"
                                        : "border-gray-300 bg-gray-100 hover:border-gray-400"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedPlan === "basic"
                                                    ? "border-purple-500"
                                                    : "border-gray-400"
                                            }`}
                                        >
                                            {selectedPlan === "basic" && (
                                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                Basic Plan (รายเดือน)
                                            </h3>
                                            <ul className="text-sm text-gray-700 mt-2 space-y-1">
                                                <li>• แสดงหอพักบน Dormly 30 วัน</li>
                                                <li>• แก้ไขข้อมูลหอพักได้ไม่จำกัด</li>
                                                <li>• รองรับปุ่มติดตามสูงสุด 10 รูป</li>
                                                <li>• ไม่มีการโปรโมตพิเศษหรือ</li>
                                                <li className="text-xs text-gray-500">
                                                    เหมาะสำหรับหอพักบนเฉลียด หรือเจ้าของหอพักที่ต้องการทดลองใช้ Dormly
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">599฿ / เดือน</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Premium Plan */}
                            <div
                                onClick={() => setSelectedPlan("premium")}
                                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                                    selectedPlan === "premium"
                                        ? "border-purple-500 bg-purple-50"
                                        : "border-gray-300 bg-gray-100 hover:border-gray-400"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedPlan === "premium"
                                                    ? "border-purple-500"
                                                    : "border-gray-400"
                                            }`}
                                        >
                                            {selectedPlan === "premium" && (
                                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                Premium Plan (รายปี)
                                            </h3>
                                            <ul className="text-sm text-gray-700 mt-2 space-y-1">
                                                <li>• แสดงหอพัก 12 เดือนเต็ม</li>
                                                <li>• Badge "Verified Premium" บนหน้าหอพัก</li>
                                                <li>• ผลลัพธ์โปรโมตบนเน็นเสิร์ช</li>
                                                <li>• รายงานสถิติการเข้าชม</li>
                                                <li>• รองรับปุ่มติดตามสูงสุด 30 รูป</li>
                                                <li className="text-xs text-gray-500">
                                                    เหมาะสำหรับเจ้าของหอพักที่ต้องการสร้างความน่าเชื่อถือและเพิ่มยอดจอง
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">5,999฿ / ปี</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                            คุณสามารถเปลี่ยนแผนหรือยกเลิกได้ทุกเมื่อในหน้า Dashboard
                        </p>
                    </div>

                    {/* Payment Method - แสดงเฉพาะเมื่อเลือก Basic หรือ Premium */}
                    {selectedPlan !== "free" && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-6">
                                เลือกรูปแบบการชำระเงิน
                            </h2>
                            <div className="space-y-4 max-w-3xl">
                                {/* บัตรบัญชีธนาคาร */}
                                <div
                                    onClick={() => setSelectedPaymentMethod("bank")}
                                    className={`p-6 rounded-lg border-2 cursor-pointer transition flex items-center gap-4 ${
                                        selectedPaymentMethod === "bank"
                                            ? "border-purple-500 bg-purple-50"
                                            : "border-gray-300 bg-gray-100 hover:border-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selectedPaymentMethod === "bank"
                                                ? "border-purple-500"
                                                : "border-gray-400"
                                        }`}
                                    >
                                        {selectedPaymentMethod === "bank" && (
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        )}
                                    </div>
                                    <span className="font-medium">บัตรบัญชีธนาคาร</span>
                                </div>

                                {/* บัตรเครดิต/บัตรเดบิต */}
                                <div
                                    onClick={() => setSelectedPaymentMethod("credit")}
                                    className={`p-6 rounded-lg border-2 cursor-pointer transition flex items-center gap-4 ${
                                        selectedPaymentMethod === "credit"
                                            ? "border-purple-500 bg-purple-50"
                                            : "border-gray-300 bg-gray-100 hover:border-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selectedPaymentMethod === "credit"
                                                ? "border-purple-500"
                                                : "border-gray-400"
                                        }`}
                                    >
                                        {selectedPaymentMethod === "credit" && (
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        )}
                                    </div>
                                    <span className="font-medium">บัตรเครดิต/บัตรเดบิต</span>
                                </div>

                                {/* QR พร้อมเพย์ */}
                                <div
                                    onClick={() => setSelectedPaymentMethod("qr")}
                                    className={`p-6 rounded-lg border-2 cursor-pointer transition flex items-center gap-4 ${
                                        selectedPaymentMethod === "qr"
                                            ? "border-purple-500 bg-purple-50"
                                            : "border-gray-300 bg-gray-100 hover:border-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selectedPaymentMethod === "qr"
                                                ? "border-purple-500"
                                                : "border-gray-400"
                                        }`}
                                    >
                                        {selectedPaymentMethod === "qr" && (
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        )}
                                    </div>
                                    <span className="font-medium">QR พร้อมเพย์</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* แสดงข้อความเมื่อเลือก Free Plan */}
                    {selectedPlan === "free" && (
                        <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="font-bold text-green-800 mb-2">กำลังพาคุณไปหน้า Dashboard...</h3>
                                    <p className="text-sm text-green-700">
                                        ไม่ต้องชำระเงิน ระบบกำลังนำคุณเข้าสู่หน้า Dashboard
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === Navigation Buttons === */}
            <div className="flex justify-center gap-4 pt-8 mt-8">
                {currentStep !== "account" && (
                    <button
                        onClick={handleBack}
                        className="px-10 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                        disabled={isProcessing}
                    >
                        back
                    </button>
                )}
                <button
                    onClick={handleNext}
                    disabled={isProcessing}
                    className={`px-12 py-3 rounded-lg font-medium transition ${
                        isProcessing
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                >
                    {isProcessing
                        ? "Processing..."
                        : currentStep === "payment"
                        ? "Submit"
                        : "next"}
                </button>
            </div>
        </div>
    </div>
</div>
);
}