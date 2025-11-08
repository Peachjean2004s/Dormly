import { useNavigate } from 'react-router-dom';
import NotLoginSidebar from '../components/layouts/NotLoginSidebar';

export default function RegisterDormOwnerPage() {
    const navigate = useNavigate();

    const handleRegister = () => {
        // ไปหน้า Multi-step Form
        navigate('/register-dormowner-form');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="hidden lg:block">
                <NotLoginSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto relative bg-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-cyan-100 to-blue-100 py-24 px-6 text-center">
                    <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                        Grow Your Dorm Business<br />with Dormly
                    </h1>
                </div>

                {/* Content Section */}
                <div className="max-w-6xl mx-auto px-8 sm:px-12 py-16 pb-32">
                    {/* Subscription Plans Info */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-bold mb-12 text-gray-900">Subscription Details</h2>

                        <div className="space-y-16">
                            {/* Basic Plan */}
                            <div className="grid md:grid-cols-2 gap-12 items-start">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 text-gray-900">1. Basic Plan (รายเดือน)</h3>
                                    <ul className="space-y-3 text-base text-gray-600 mb-6">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>แสดงหอพักบน Dormly 30 วัน</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>แก้ไขข้อมูลหอพักได้ไม่จำกัด</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>รองรับรูปภาพหอพัก 10 รูป</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>ไม่มีการโปรโมตหน้าแรก</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-base text-gray-600 mb-6">
                                        เหมาะสำหรับหอพักขนาดเล็ก หรือหากต้องการลงทดลองในระบบของ Dormly
                                    </p>
                                    <div className="text-4xl font-bold text-purple-600">ราคา : 599 บาท/เดือน</div>
                                </div>
                            </div>

                            {/* Premium Plan */}
                            <div className="grid md:grid-cols-2 gap-12 items-start">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 text-gray-900">2. Premium Plan (รายปี)</h3>
                                    <ul className="space-y-3 text-base text-gray-600 mb-6">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>แสดงหอพัก 12 เดือนเต็ม</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>Badge "Verified Premium" บนหน้าหอพัก</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>หอพักถูกโปรโมตบนหน้าแนะนำ search</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>รองรับการโฆษณาบ้าง</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3">•</span>
                                            <span>รองรับรูปภาพหอพัก 30 รูป</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-base text-gray-600 mb-6">
                                        เหมาะสำหรับหอพักขนาดกลางถึงใหญ่ที่ต้องการสร้างแบรนด์และเพิ่มโอกาสเพื่อหาลูกค้า
                                    </p>
                                    <div className="text-4xl font-bold text-purple-600">ราคา : 5,999 บาท/ปี</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Policy */}
                    <div className="border-t border-gray-200 pt-16">
                        <h2 className="text-3xl font-bold mb-12 text-gray-900">Dormly Privacy Policy & Terms of Service</h2>
                        <div className="text-base text-gray-600 leading-relaxed space-y-8 max-w-5xl">
                            <p className="text-lg">
                                Dormly ให้ความสำคัญกับความเป็นส่วนตัวและความปลอดภัยของผู้ใช้ทุกคน ทั้งผู้หาหอพัก ("User") 
                                และเจ้าของหอพัก ("DormOwner") โดยเฉพาะข้อมูลที่อยู่บนเว็บ Dormly นี้ 
                                แน่นอนจึงปลอดภัยจากการพิจารณา รวมถึงสร้างการป้องกันในการใช้งานระบบ
                            </p>

                            <div className="grid md:grid-cols-2 gap-12 mt-12">
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">1. ข้อมูลที่ Dormly รวบรวม</h3>
                                    <p className="mb-4 text-gray-600">เมื่อคุณเข้าใช้งานเว็บไซต์ Dormly เราจะรวบรวมข้อมูลดังต่อไปนี้:</p>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ข้อมูลส่วนบุคคล: ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์, Line ID</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ข้อมูลการสร้างผู้ใช้งาน: ชื่อใช้ (username), รหัสผ่าน (เก็บรหัสผ่านความปลอดภัย)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ข้อมูลหอพัก: ชื่อหอพัก, ที่อยู่, ราคา, รูปภาพ (สำหรับ DormOwner)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ข้อมูลการจอง-การจอง: หมายเลขห้องที่จอง, วันที่, จำนวนเงิน, ช่องทางการชำระ (เช่น บัตรเครดิต, PromptPay)</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">2. วัตถุประสงค์การใช้ข้อมูล</h3>
                                    <p className="mb-4 text-gray-600">Dormly ใช้ข้อมูลของคุณเพื่อ:</p>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>สร้างบัญชีผู้ใช้และระบบล็อกอิน</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ตรวจสอบสิทธิอนุญาตและป้องกันข้อมูลผิดพลาด</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ประมวลผลและระบุการชำระเงิน</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ปรับปรุงประสบการณ์การใช้งานและแนะนำหอพักที่เหมาะสม</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ส่งข้อความเตือน เช่น การจองสำเร็จ หรือโปรโมชั่น</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ป้องกันการทุจริตและป้องกันการใช้งานในทางที่ผิด</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 mt-12">
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">3. การรักษาความปลอดภัยข้อมูล</h3>
                                    <p className="mb-4 text-gray-600">Dormly ใช้มาตรการรักษาความปลอดภัย:</p>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>การเข้ารหัสข้อมูล (Encrypted Database)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>รักษาสิทธิ์การเข้าถึงข้อมูล</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>การสำรองข้อมูล (Backup) เพื่อป้องกันการสูญหาย</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ช่องทางติดต่อ Support หากพบปัญหา</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">4. การแบ่งปันข้อมูล</h3>
                                    <p className="mb-4 text-gray-600">Dormly จะไม่แบ่งปันข้อมูลส่วนตัว ยกเว้นกรณี:</p>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>เพื่อปฏิบัติตามกฎหมาย</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>เพื่อตรวจสอบการทุจริต</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 mt-12">
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">5. คุกกี้ (Cookies)</h3>
                                    <p className="mb-4 text-gray-600">Dormly ใช้คุกกี้เพื่อ:</p>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>เก็บข้อมูลการเข้าสู่ระบบ</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ปรับการแสดงผลให้เหมาะสม</span>
                                        </li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-3">
                                        คุณสามารถปิดคุกกี้ได้ในเบราว์เซอร์ แต่อาจส่งผลต่อการใช้งาน
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">6. สิทธิของผู้ใช้</h3>
                                    <p className="mb-4 text-gray-600">คุณสามารถ:</p>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ขอดูข้อมูลส่วนตัวของคุณ</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ขอแก้ไขหรือลบข้อมูล</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-purple-600 mr-3 mt-1">•</span>
                                            <span>ขอลบบัญชีภายใน 30 วัน</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h3 className="text-xl font-bold mb-4 text-gray-900">7. การติดต่อ Dormly</h3>
                                <p className="text-gray-600">หากมีข้อสงสัยเกี่ยวกับความเป็นส่วนตัว:</p>
                                <ul className="space-y-2 text-gray-600 mt-3">
                                    <li className="flex items-start">
                                        <span className="text-purple-600 mr-3 mt-1">•</span>
                                        <span>ติดต่อ: support@dormly.com</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-600 mr-3 mt-1">•</span>
                                        <span>หรือส่งผ่าน Support</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-16 pt-12 border-t border-gray-200">
                                <h2 className="text-2xl font-bold mb-8 text-gray-900">Terms & Policy</h2>
                                
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-lg font-semibold mb-3 text-gray-900">1. ข้อตกลงของเจ้าของหอพัก</h4>
                                        <ul className="space-y-2 text-gray-600">
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>ต้องให้ข้อมูลที่ถูกต้องและตรงความจริง</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>รับผิดชอบในเนื้อหาที่ลงโฆษณา</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>ยกเลิกบริการต้องแจ้งล่วงหน้า</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>Dormly มีสิทธิ์ระงับบัญชีหากพบการละเมิด</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-3 text-gray-900">2. การชำระเงินและการคืนเงิน</h4>
                                        <ul className="space-y-2 text-gray-600">
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>ค่าบริการ Subscription ไม่สามารถคืนเงินได้</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>Dormly จะแจ้งเตือนก่อนหมดอายุ</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>ดูข้อมูลการชำระเงินได้ใน Dashboard</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-3 text-gray-900">3. การระงับบัญชี</h4>
                                        <p className="mb-3 text-gray-600">Dormly มีสิทธิระงับบัญชีในกรณี:</p>
                                        <ul className="space-y-2 text-gray-600">
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>ให้ข้อมูลเท็จหรือหลอกลวง</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>ละเมิดกฎหมายหรือสิทธิผู้อื่น</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-purple-600 mr-3 mt-1">•</span>
                                                <span>กระทำการที่เป็นอันตรายต่อระบบ</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-3 text-gray-900">4. การปฏิเสธความรับผิดชอบ</h4>
                                        <p className="text-gray-600">
                                            Dormly อาจมีข้อผิดพลาดในข้อมูลหอพัก โปรดตรวจสอบกับเจ้าของหอพักโดยตรง 
                                            ก่อนตัดสินใจจอง Dormly ไม่รับผิดชอบต่อความเสียหายที่เกิดขึ้น
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Centered Register Button - Bottom */}
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    <button
                        onClick={handleRegister}
                        className="px-10 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2 text-lg"
                    >
                        <span>dormly register</span>
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
                                d="M13 7l5 5m0 0l-5 5m5-5H6" 
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}