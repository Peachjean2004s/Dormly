import { useAuth } from '../hooks/use-auth';
import RequireAuth from '../components/common/NeedLogin';
import NotAvailable from '../components/common/NotAvailable';

export default function ChatPage() {
    const { role } = useAuth();

    if (role === 'guest') {
        return <RequireAuth />;
    }

    return (
        <NotAvailable />
    );
}