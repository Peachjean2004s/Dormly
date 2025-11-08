export default function RequireAuth() {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[calc(100vh-4rem)] bg-white">
        <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            You need to log in to use this feature
            </h1>
            <p className="text-base md:text-lg text-gray-600">
            Please click "Login for User" on the left sidebar to sign in.
            </p>
        </div>
        </div>
    );
}