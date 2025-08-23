export const DEPARTMENTS = [
    { id: 'computer_science', name: 'Computer Science', code: 'CS' },
    { id: 'electrical', name: 'Electrical Engineering', code: 'EE' },
    { id: 'mechanical', name: 'Mechanical Engineering', code: 'ME' },
    { id: 'civil', name: 'Civil Engineering', code: 'CE' },
    { id: 'chemical', name: 'Chemical Engineering', code: 'CH' },
    { id: 'electronics', name: 'Electronics & Communication', code: 'EC' },
    { id: 'information_technology', name: 'Information Technology', code: 'IT' },
    { id: 'biotechnology', name: 'Biotechnology', code: 'BT' },
    { id: 'aerospace', name: 'Aerospace Engineering', code: 'AE' },
    { id: 'general', name: 'General/Cross-Department', code: 'GEN' }
];

export const getDepartmentById = (id) => {
    return DEPARTMENTS.find(dept => dept.id === id);
};

export const getDepartmentName = (id) => {
    const dept = getDepartmentById(id);
    return dept ? dept.name : 'Unknown Department';
};
