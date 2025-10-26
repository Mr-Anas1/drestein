# Database Read Optimization Guide

## Current Issues Found

### 1. **/events page** - Fetches ALL events & special events
- **Problem**: Loads entire collections on every visit
- **Current reads**: ~500-700 per page load
- **Solution**: Use caching hook + pagination

### 2. **/departments/[id] page** - Fetches ALL then filters client-side
- **Problem**: Loads all events, then filters by department in browser
- **Current reads**: ~500-700 per page load
- **Solution**: Use department filter in API query

### 3. **/my-passes page** - Fetches ALL special events
- **Problem**: Loads entire special events collection
- **Current reads**: ~200+ per page load
- **Solution**: Use caching hook

### 4. **/admin page** - Fetches ALL events
- **Problem**: No pagination or filtering at API level
- **Current reads**: ~500+ per page load
- **Solution**: Use pagination + department filter

### 5. **/my-registrations page** - Fetches ALL events & special events
- **Problem**: Already identified, needs caching hook integration
- **Current reads**: ~700 per page load
- **Solution**: Use caching hook (already created)

## Optimization Strategy

### Phase 1: Update API Calls to Use Query Parameters ✅
- `/api/events?department=CSE&limit=20` instead of `/api/events`
- `/api/special-events?category=workshop&limit=20` instead of `/api/special-events`

### Phase 2: Integrate Caching Hook
- Use `/src/hooks/useEventCache.js` in all pages
- 5-minute cache prevents redundant reads

### Phase 3: Implement Pagination
- Load 20-50 items at a time
- "Load More" button for additional items

## Expected Impact

| Page | Before | After | Reduction |
|------|--------|-------|-----------|
| /events | 700 reads | 40 reads | 94% |
| /departments/[id] | 700 reads | 10 reads | 98% |
| /my-passes | 200 reads | 20 reads | 90% |
| /admin | 500 reads | 50 reads | 90% |
| /my-registrations | 700 reads | 40 reads | 94% |

**Total daily capacity**: From ~70 users/day → **700+ users/day** (10x improvement)

## Implementation Files

1. **Caching Hook** (already created): `/src/hooks/useEventCache.js`
2. **Updated API Routes** (already done):
   - `/src/app/api/events/route.js`
   - `/src/app/api/special-events/route.js`

3. **Pages to Update**:
   - `/src/app/events/page.jsx`
   - `/src/app/departments/[id]/page.jsx`
   - `/src/app/my-passes/page.jsx`
   - `/src/app/admin/page.jsx`
   - `/src/app/my-registrations/page.jsx`
   - `/src/app/buy-pass/page.jsx`
