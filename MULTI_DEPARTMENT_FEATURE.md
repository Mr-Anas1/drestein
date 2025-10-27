# Multi-Department Special Events Feature

## Overview
Special events/workshops can now be assigned to **multiple departments** instead of just one. An event created for CSE can also be shown in AI-DS and IT departments simultaneously.

## What Changed

### 1. Database Schema
Events now use a `departments` array instead of a single `department` field:

```javascript
// OLD
{ department: "CSE" }

// NEW
{ departments: ["CSE", "AI-DS", "IT"] }
```

### 2. UI Components

#### Adding Events (`AddSpecialEventModal.jsx`)
- Department selector changed from dropdown to **multi-select checkboxes**
- All 18 departments available in a scrollable grid
- At least one department must be selected
- Visual feedback for selected departments

#### Editing Events (`EditSpecialEventModal.jsx`)
- Same multi-select interface as Add modal
- Automatically converts old single-department events to array format
- Backward compatible with existing events

### 3. API Endpoints

All endpoints in `/api/special-events/route.js` support the new format:

#### POST (Create Event)
```javascript
{
  title: "Web Dev Workshop",
  departments: ["CSE", "IT"],  // NEW: Array of departments
  category: "workshop",
  // ... other fields
}
```

#### GET (Fetch Events)
- Filters by department automatically
- Supports both old and new formats
- Example: `?department=CSE` returns events with CSE in their departments array

#### PUT (Update Event)
- Update departments array just like any other field
- Validates at least one department is selected

## Migration

### For Existing Events
Run the migration script to convert all existing events:

```bash
node scripts/migrate-departments.js
```

This script will:
- Convert all `department: "CSE"` to `departments: ["CSE"]`
- Skip already-migrated events
- Show a detailed report of changes
- Handle errors gracefully

### Backward Compatibility
- ✅ Old events with single `department` field still work
- ✅ API automatically handles both formats
- ✅ No breaking changes
- ✅ Gradual migration possible

## Usage Examples

### Creating a Multi-Department Event
1. Open "Add Special Event" modal
2. Select multiple departments using checkboxes
3. Fill in other event details
4. Submit - event will appear in all selected departments

### Editing an Event
1. Open "Edit Special Event" modal
2. Modify department selection (add/remove departments)
3. Save changes

### Filtering by Department
The API automatically filters events by department:
- Events with CSE in their departments array appear on CSE page
- Same event appears on all its selected departments

## Technical Details

### Validation
- At least one department must be selected (enforced in UI and API)
- Department codes are normalized (CSE-CYB, CSE-IOT, MED-ELE)
- Invalid department codes are rejected

### Performance
- In-memory filtering for department queries
- 30-second cache for API responses
- Request deduplication prevents duplicate database reads

### Error Handling
- Clear error messages if no departments selected
- Graceful fallback for malformed data
- Migration script reports all errors

## Files Modified

| File | Changes |
|------|---------|
| `src/components/AddSpecialEventModal.jsx` | Multi-select UI for departments |
| `src/components/EditSpecialEventModal.jsx` | Multi-select UI for departments |
| `src/app/api/special-events/route.js` | Array-based filtering, validation |
| `scripts/migrate-departments.js` | NEW: Migration script |

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Create event with multiple departments
- [ ] Event appears on all selected department pages
- [ ] Edit event to add/remove departments
- [ ] Changes reflect immediately
- [ ] Old single-department events still work
- [ ] API filtering works correctly

## Troubleshooting

### Migration Script Issues
```bash
# Ensure service account file exists
ls firebase-service-account.json

# Run with Node.js 14+
node --version

# Run migration
node scripts/migrate-departments.js
```

### Events Not Appearing
- Check if event's `departments` array includes the department
- Verify department code matches (CSE, not cse)
- Clear browser cache if needed

### API Errors
- Ensure at least one department is selected
- Check department codes are valid
- Verify Firebase credentials in environment

## Future Enhancements

Possible improvements:
- Bulk edit departments for multiple events
- Department-specific event customization
- Event visibility rules per department
- Department-specific pricing/registration
