'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCompletionModal from './ProfileCompletionModal';
import PhoneNumberModal from './PhoneNumberModal';

export default function ProfileGuard({ children }) {
    const { user, isStudent, profileCompleted, loading, refreshStudentProfile, studentProfile } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);

    useEffect(() => {
        // Only show modal for authenticated students who haven't completed profile
        if (!loading && user && isStudent && !profileCompleted) {
            setShowModal(true);
            setShowPhoneModal(false);
        } else if (!loading && user && isStudent && profileCompleted && !studentProfile?.phone) {
            setShowModal(false);
            setShowPhoneModal(true);
        } else {
            setShowModal(false);
            setShowPhoneModal(false);
        }
    }, [user, isStudent, profileCompleted, loading, studentProfile?.phone]);

    const handleProfileComplete = async () => {
        // Refresh the profile to get updated data
        await refreshStudentProfile();
        setShowModal(false);
    };

    return (
        <>
            {showModal && <ProfileCompletionModal onComplete={handleProfileComplete} />}
            {showPhoneModal && (
                <PhoneNumberModal onComplete={async () => { await refreshStudentProfile(); setShowPhoneModal(false); }} />
            )}
            {children}
        </>
    );
}
