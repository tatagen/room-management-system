# Security Specification: Hotel CleanFlow

## Data Invariants
1. A Room status can only follow the sequence: `dirty -> cleaning -> checking -> clean`.
2. A Report must be linked to a valid roomId.
3. Only Managers or the Assigned Cleaner can update a Room's status.
4. Managers can assign/unassign staff to rooms.
5. All writes must have `updatedAt` or `createdAt` set to `request.time`.

## Potential Attack Payloads (The Dirty Dozen)
1. **Status Skipping:** Cleaner attempts to update status from `dirty` directly to `clean`.
2. **Identity Spoofing (Room):** Cleaner A attempts to update a room assigned to Cleaner B.
3. **Identity Spoofing (Report):** User attempts to create a report with another user's `staffId`.
4. **PO Poisoning:** User attempts to create a report with a 1MB `description` string.
5. **Unauthorized Assignment:** Cleaner attempts to reassign a room to themselves.
6. **Privilege Escalation:** Cleaner attempts to update a Staff document to change their role to `manager`.
7. **Orphaned Report:** Creating a report for a `roomId` that does not exist.
8. **Shadow Field:** Cleaner attempts to add an `isVerified` boolean to a Room document.
9. **History Manipulation:** Cleaner attempts to set a manual `updatedAt` in the past.
10. **Global Read:** Unauthenticated user attempts to list all reports.
11. **Report Modification:** Cleaner attempts to update/delete an existing report to hide an issue.
12. **Room Deletion:** Cleaner attempts to delete a Room document.

## Rule Primitives
- `isAdmin()`: Check if user is in `staff` collection with role `manager`.
- `isStaff()`: Check if user exists in `staff` collection.
- `isValidRoom(data)`: Validate Room schema.
- `isValidReport(data)`: Validate Report schema.
