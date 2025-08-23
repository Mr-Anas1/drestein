import { DEPARTMENTS, getDepartmentName } from '@/constants/departments';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentSelect({ value, onChange, required = false, disabled = false }) {
    const { isDepartmentAdmin, userDepartment } = useAuth();
    
    const isDisabled = disabled || isDepartmentAdmin;
    const selectValue = isDepartmentAdmin ? userDepartment : value;

    return (
        <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">Department</label>
            <select
                value={selectValue}
                onChange={onChange}
                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                required={required}
                disabled={isDisabled}
            >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
            </select>
            {isDepartmentAdmin && (
                <p className="text-xs text-muted-text mt-1">
                    You can only create events for your department: {getDepartmentName(userDepartment)}
                </p>
            )}
        </div>
    );
}
