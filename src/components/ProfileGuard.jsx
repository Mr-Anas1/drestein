'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCompletionModal from './ProfileCompletionModal';

export default function ProfileGuard({ children }) {
    const { user, isStudent, profileCompleted, loading, refreshStudentProfile } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Only show modal for authenticated students who haven't completed profile
        if (!loading && user && isStudent && !profileCompleted) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [user, isStudent, profileCompleted, loading]);

    const handleProfileComplete = async () => {
        // Refresh the profile to get updated data
        await refreshStudentProfile();
        setShowModal(false);
    };

    return (
        <>
            {showModal && <ProfileCompletionModal onComplete={handleProfileComplete} />}
            {children}
        </>
    );
}
