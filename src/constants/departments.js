export const DEPARTMENTS = [
    { id: 'AI-DS', name: 'Artificial Intelligence and Data Science', short: 'AI-DS', code: 'AI-DS', image: '/aids.jpeg' },
    { id: 'AI-ML', name: 'Artificial Intelligence and Machine Learning', short: 'AI-ML', code: 'AI-ML', image: '/aiml.jpeg' },
    { id: 'AGRI', name: 'Agricultural Engineering', short: 'AGRI', code: 'AGRI', image: '/agri.jpeg' },
    { id: 'BIO-MED', name: 'Biomedical Engineering', short: 'BIO-MED', code: 'BME', image: '/bme.jpeg' },
    { id: 'CHEM', name: 'Chemical Engineering', short: 'CHEM', code: 'CHEM', image: '/chem.jpeg' },
    { id: 'CIVIL', name: 'Civil Engineering', short: 'CIVIL', code: 'CIVIL', image: '/civil.jpeg' },
    { id: 'CSE', name: 'Computer Science and Engineering', short: 'CSE', code: 'CSE', image: '/cse.jpeg' },
    { id: 'CSE-CYB', name: 'Computer Science and Engineering (Cyber Security)', short: 'CSE-CYB', code: 'CYB', image: '/cyber.jpeg' },
    { id: 'CSE-IOT', name: 'Computer Science and Engineering (Internet of Things)', short: 'CSE-IOT', code: 'IOT', image: '/iot.jpeg' },
    { id: 'IT', name: 'Information Technology', short: 'IT', code: 'IT', image: '/it.jpeg' },
    { id: 'ECE', name: 'Electronics and Communication Engineering', short: 'ECE', code: 'ECE', image: '/ece.jpeg' },
    { id: 'EEE', name: 'Electrical and Electronics Engineering', short: 'EEE', code: 'EEE', image: '/eee.jpeg' },
    { id: 'EIE', name: 'Electronics and Instrumentation Engineering', short: 'EIE', code: 'EIE', image: '/eie.jpeg' },
    { id: 'MECH', name: 'Mechanical Engineering', short: 'MECH', code: 'MECH', image: '/mech.jpeg' },
    { id: 'MED-ELE', name: 'Medical Electronics Engineering', short: 'MED-ELE', code: 'MED', image: '/med-ele.jpeg' },
    { id: 'MBA', name: 'Master of Business Administration', short: 'MBA', code: 'MBA', image: '/mba.jpg' },
    { id: 'S&H', name: 'Science and Humanities', short: 'S&H', code: 'S&H', image: '/s&h.jpg' },
];

export const getDepartmentById = (id) => {
    return DEPARTMENTS.find(dept => dept.id === id);
};

export const getDepartmentName = (id) => {
    const dept = getDepartmentById(id);
    return dept ? dept.name : 'Unknown Department';
};

