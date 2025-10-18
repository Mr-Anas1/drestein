export const DEPARTMENTS = [
    { id: 'AI-DS', name: 'Artificial Intelligence and Data Science', short: 'AI-DS' },
    { id: 'AI-ML', name: 'Artificial Intelligence and Machine Learning', short: 'AI-ML' },
    { id: 'AGRI', name: 'Agricultural Engineering', short: 'AGRI' },
    { id: 'BIO-MED', name: 'Biomedical Engineering', short: 'BIO-MED' },
    { id: 'CHEM', name: 'Chemical Engineering', short: 'CHEM' },
    { id: 'CIVIL', name: 'Civil Engineering', short: 'CIVIL' },
    { id: 'CSE', name: 'Computer Science and Engineering', short: 'CSE' },
    { id: 'CSE-CYB', name: 'Computer Science and Engineering (Cyber Security)', short: 'CSE-CYB' },
    { id: 'CSE-IOT', name: 'Computer Science and Engineering (Internet of Things)', short: 'CSE-IOT' },
    { id: 'IT', name: 'Information Technology', short: 'IT' },
    { id: 'ECE', name: 'Electronics and Communication Engineering', short: 'ECE' },
    { id: 'EEE', name: 'Electrical and Electronics Engineering', short: 'EEE' },
    { id: 'EIE', name: 'Electronics and Instrumentation Engineering', short: 'EIE' },
    { id: 'MECH', name: 'Mechanical Engineering', short: 'MECH' },
    { id: 'MED-ELE', name: 'Medical Electronics Engineering', short: 'MED-ELE' },
    { id: 'MBA', name: 'Master of Business Administration', short: 'MBA' },
    { id: 'S&H', name: 'Science and Humanities', short: 'S&H' },
];

export const getDepartmentById = (id) => {
    return DEPARTMENTS.find(dept => dept.id === id);
};

export const getDepartmentName = (id) => {
    const dept = getDepartmentById(id);
    return dept ? dept.name : 'Unknown Department';
};

