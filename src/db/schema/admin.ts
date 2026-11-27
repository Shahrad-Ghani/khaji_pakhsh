// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import { pgTable, uniqueIndex, check, bigint, text, boolean, timestamp, unique, index, foreignKey, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const adminUsers = pgTable("admin_users", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "admin_users_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	displayName: text("display_name").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("admin_users_email_ci_uq").using("btree", sql`lower(email)`),
	check("admin_users_email_not_blank_ck", sql`length(btrim(email)) > 3`),
	check("admin_users_password_hash_not_blank_ck", sql`length(password_hash) > 0`),
]);

export const roles = pgTable("roles", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "roles_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	code: text().notNull(),
	labelFa: text("label_fa").notNull(),
}, (table) => [
	unique("roles_code_key").on(table.code),
	check("roles_code_format_ck", sql`code ~ '^[a-z][a-z0-9_]*$'::text`),
]);

export const permissions = pgTable("permissions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "permissions_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	code: text().notNull(),
	labelFa: text("label_fa").notNull(),
}, (table) => [
	unique("permissions_code_key").on(table.code),
	check("permissions_code_format_ck", sql`code ~ '^[a-z][a-z0-9_.]*$'::text`),
]);

export const auditLogs = pgTable("audit_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "audit_logs_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	actorType: text("actor_type").default('admin').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	actorUserId: bigint("actor_user_id", { mode: "number" }),
	entityType: text("entity_type").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	entityId: bigint("entity_id", { mode: "number" }),
	action: text().notNull(),
	beforeData: jsonb("before_data"),
	afterData: jsonb("after_data"),
	requestId: text("request_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("audit_actor_time_ix").using("btree", table.actorUserId.asc().nullsLast(), table.createdAt.desc().nullsFirst()),
	index("audit_entity_time_ix").using("btree", table.entityType.asc().nullsLast(), table.entityId.asc().nullsLast(), table.createdAt.desc().nullsFirst()),
	foreignKey({
			columns: [table.actorUserId],
			foreignColumns: [adminUsers.id],
			name: "audit_logs_actor_user_id_fkey"
		}).onDelete("restrict"),
	check("audit_actor_type_ck", sql`actor_type = ANY (ARRAY['admin'::text, 'system'::text])`),
	check("audit_actor_consistency_ck", sql`((actor_type = 'admin'::text) AND (actor_user_id IS NOT NULL)) OR ((actor_type = 'system'::text) AND (actor_user_id IS NULL))`),
	check("audit_entity_not_blank_ck", sql`length(btrim(entity_type)) > 0`),
	check("audit_action_not_blank_ck", sql`length(btrim(action)) > 0`),
]);

export const adminUserRoles = pgTable("admin_user_roles", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	adminUserId: bigint("admin_user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roleId: bigint("role_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adminUserId],
			foreignColumns: [adminUsers.id],
			name: "admin_user_roles_admin_user_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "admin_user_roles_role_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.adminUserId, table.roleId], name: "admin_user_roles_pkey"}),
]);

export const rolePermissions = pgTable("role_permissions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roleId: bigint("role_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	permissionId: bigint("permission_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.roleId, table.permissionId], name: "role_permissions_pkey"}),
]);
