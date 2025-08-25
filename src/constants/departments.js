export const DEPARTMENTS = [
    { id: 'agriculture', name: 'Agriculture Engineering', code: 'AG' },
    { id: 'biomedical', name: 'Biomedical Engineering', code: 'BT' },
    { id: 'chemical', name: 'Chemical Engineering', code: 'CH' },
    { id: 'civil', name: 'Civil Engineering', code: 'CE' },
    { id: 'electrical', name: 'Electrical and Electronics Engineering', code: 'EE' },
    { id: 'electronics', name: 'Electronics & Communication Engineering', code: 'EC' },
    { id: 'instrumentation', name: 'Electronics & Instrumentation Engineering', code: 'EI' },
    { id: 'management', name: 'Management Studies', code: 'MG' },
    { id: 'mechanical', name: 'Mechanical Engineering', code: 'ME' },
    { id: 'medical', name: 'Medical Electronics Engineering', code: 'MEE' },
    { id: 'scoft', name: 'SCOFT', code: 'CS' }
];

export const getDepartmentById = (id) => {
    return DEPARTMENTS.find(dept => dept.id === id);
};

export const getDepartmentName = (id) => {
    const dept = getDepartmentById(id);
    return dept ? dept.name : 'Unknown Department';
};

