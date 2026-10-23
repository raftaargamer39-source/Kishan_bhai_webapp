# Security Specification: Kishan Bhai Firestore Security

## 1. Data Invariants
1. **User Identity & PII Isolation**: A user can only read and write their own personal profile `/users/{userId}`. Blanket listing of users is forbidden to non-administrators to prevent harvesting PII (phone numbers, full names, landholdings).
2. **Cluster Governance**: Clusters `/clusters/{clusterId}` can be read by registered farmers and buyers, but only the assigned Lead Champion (`championId == request.auth.uid`) or an administrator can update cluster properties.
3. **Collective Procurement (Bulk Requirements)**: Group input orders `/bulkRequirements/{reqId}` can be browsed by all authenticated farmers. Only Champions and Admins can create or update requirement milestones.
4. **Machinery Rental Integrity**: Machinery items `/machinery/{machineryId}` can be viewed publicly/by members. Modifications to machinery availability, rates, or listings require the owner or champion authority.
5. **Harvest Pool Lots**: Harvest lots `/harvestLots/{lotId}` can be browsed by registered buyers and farmers. Farmers can only modify or delete their own listed lots (`farmerId == request.auth.uid`).
6. **Transaction Isolation**: Transaction records `/transactions/{txId}` must strictly enforce `resource.data.userId == request.auth.uid` for read and write. No cross-tenant access.
7. **Soil Health Cards**: Soil records `/soilRecords/{recordId}` can only be read and managed by the owner farmer (`farmerId == request.auth.uid`) or authorized agronomist/admin.
8. **Admin Privilege**: Administrator operations are validated against verified admin records or explicit server authorization (`admin` email match with verified token).

## 2. The Dirty Dozen Attack Payloads (Must be Denied)
1. User A attempting to read User B's `/users/{userB}` profile without admin privileges.
2. User A attempting to update `role` field on their own profile to `ADMIN`.
3. Anonymous / Unauthenticated client attempting to write to `/clusters/{clusterId}`.
4. Farmer attempting to update another farmer's harvest lot `/harvestLots/{lotId}`.
5. Farmer injecting malicious oversized payload (1MB string) into `name` or `description`.
6. Client attempting to inject invalid enum string into `BulkOrderRequirement.status`.
7. Client attempting to modify immutable `id`, `createdAt`, or `userId` on `/transactions/{txId}`.
8. Unauthenticated client attempting to list `/transactions`.
9. Client attempting to forge another user's `userId` on transaction creation.
10. Attacker querying `/users` with blanket `where` clause to dump phone numbers.
11. Attacker injecting non-standard path characters or shell/script injection into path ID.
12. Attacker attempting to delete a confirmed bulk order requirement while in status `SHIPPED`.
