
import { relations } from "drizzle-orm/relations";
import {
	adminUsers,
	mediaAssets,
	contentItems,
	categories,
	brands,
	products,
	productMedia,
	priceImportBatches,
	productPrices,
	priceHistory,
	priceLists,
	priceListPublications,
	pages,
	pageRevisions,
	pageRevisionMedia,
	navigationMenus,
	navigationItems,
	siteSettings,
	seoRedirects,
	auditLogs,
	adminUserRoles,
	roles,
	rolePermissions,
	permissions,
	productCategories,
	categoryAttributes,
	attributes,
	productAttributeValues,
	priceImportRows,
	priceListPublicationItems
} from "./schema";

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
	adminUser: one(adminUsers, {
		fields: [mediaAssets.uploadedBy],
		references: [adminUsers.id]
	}),
	contentItems: many(contentItems),
	categories: many(categories),
	brands: many(brands),
	productMedias: many(productMedia),
	priceImportBatches: many(priceImportBatches),
	pageRevisions: many(pageRevisions),
	pageRevisionMedias: many(pageRevisionMedia),
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
	mediaAssets: many(mediaAssets),
	priceImportBatches: many(priceImportBatches),
	productPrices: many(productPrices),
	priceHistories: many(priceHistory),
	priceListPublications_generatedBy: many(priceListPublications, {
		relationName: "priceListPublications_generatedBy_adminUsers_id"
	}),
	priceListPublications_publishedBy: many(priceListPublications, {
		relationName: "priceListPublications_publishedBy_adminUsers_id"
	}),
	pageRevisions_createdBy: many(pageRevisions, {
		relationName: "pageRevisions_createdBy_adminUsers_id"
	}),
	pageRevisions_reviewedBy: many(pageRevisions, {
		relationName: "pageRevisions_reviewedBy_adminUsers_id"
	}),
	pageRevisions_publishedBy: many(pageRevisions, {
		relationName: "pageRevisions_publishedBy_adminUsers_id"
	}),
	siteSettings: many(siteSettings),
	seoRedirects: many(seoRedirects),
	auditLogs: many(auditLogs),
	adminUserRoles: many(adminUserRoles),
}));

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
	mediaAsset: one(mediaAssets, {
		fields: [contentItems.ogImageMediaId],
		references: [mediaAssets.id]
	}),
	category: one(categories),
	brand: one(brands),
	product: one(products),
	priceList: one(priceLists),
	page: one(pages),
	navigationItems: many(navigationItems),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	category: one(categories, {
		fields: [categories.parentId],
		references: [categories.id],
		relationName: "categories_parentId_categories_id"
	}),
	categories: many(categories, {
		relationName: "categories_parentId_categories_id"
	}),
	mediaAsset: one(mediaAssets, {
		fields: [categories.heroMediaId],
		references: [mediaAssets.id]
	}),
	contentItem: one(contentItems, {
		fields: [categories.contentItemId, categories.contentType],
		references: [contentItems.id, contentItems.contentType]
	}),
	products: many(products),
	priceLists: many(priceLists),
	productCategories: many(productCategories),
	categoryAttributes: many(categoryAttributes),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
	mediaAsset: one(mediaAssets, {
		fields: [brands.logoMediaId],
		references: [mediaAssets.id]
	}),
	contentItem: one(contentItems, {
		fields: [brands.contentItemId, brands.contentType],
		references: [contentItems.id, contentItems.contentType]
	}),
	products: many(products),
	priceLists: many(priceLists),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
	brand: one(brands, {
		fields: [products.brandId],
		references: [brands.id]
	}),
	category: one(categories, {
		fields: [products.primaryCategoryId],
		references: [categories.id]
	}),
	contentItem: one(contentItems, {
		fields: [products.contentItemId, products.contentType],
		references: [contentItems.id, contentItems.contentType]
	}),
	productMedias: many(productMedia),
	productPrice: one(productPrices),
	priceHistories: many(priceHistory),
	productCategories: many(productCategories),
	productAttributeValues: many(productAttributeValues),
	priceImportRows: many(priceImportRows),
	priceListPublicationItems: many(priceListPublicationItems),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
	product: one(products, {
		fields: [productMedia.productId],
		references: [products.id]
	}),
	mediaAsset: one(mediaAssets, {
		fields: [productMedia.mediaId],
		references: [mediaAssets.id]
	}),
}));

export const priceImportBatchesRelations = relations(priceImportBatches, ({ one, many }) => ({
	mediaAsset: one(mediaAssets, {
		fields: [priceImportBatches.sourceFileMediaId],
		references: [mediaAssets.id]
	}),
	adminUser: one(adminUsers, {
		fields: [priceImportBatches.createdBy],
		references: [adminUsers.id]
	}),
	priceHistories: many(priceHistory),
	priceImportRows: many(priceImportRows),
}));

export const productPricesRelations = relations(productPrices, ({ one }) => ({
	adminUser: one(adminUsers, {
		fields: [productPrices.updatedBy],
		references: [adminUsers.id]
	}),
	product: one(products, {
		fields: [productPrices.productId],
		references: [products.id]
	}),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
	product: one(products, {
		fields: [priceHistory.productId],
		references: [products.id]
	}),
	priceImportBatch: one(priceImportBatches, {
		fields: [priceHistory.importBatchId],
		references: [priceImportBatches.id]
	}),
	adminUser: one(adminUsers, {
		fields: [priceHistory.changedBy],
		references: [adminUsers.id]
	}),
}));

export const priceListsRelations = relations(priceLists, ({ one, many }) => ({
	category: one(categories, {
		fields: [priceLists.categoryId],
		references: [categories.id]
	}),
	brand: one(brands, {
		fields: [priceLists.brandId],
		references: [brands.id]
	}),
	contentItem: one(contentItems, {
		fields: [priceLists.contentItemId, priceLists.contentType],
		references: [contentItems.id, contentItems.contentType]
	}),
	priceListPublications: many(priceListPublications),
}));

export const priceListPublicationsRelations = relations(priceListPublications, ({ one, many }) => ({
	priceList: one(priceLists, {
		fields: [priceListPublications.priceListId],
		references: [priceLists.id]
	}),
	adminUser_generatedBy: one(adminUsers, {
		fields: [priceListPublications.generatedBy],
		references: [adminUsers.id],
		relationName: "priceListPublications_generatedBy_adminUsers_id"
	}),
	adminUser_publishedBy: one(adminUsers, {
		fields: [priceListPublications.publishedBy],
		references: [adminUsers.id],
		relationName: "priceListPublications_publishedBy_adminUsers_id"
	}),
	priceListPublicationItems: many(priceListPublicationItems),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
	contentItem: one(contentItems, {
		fields: [pages.contentItemId, pages.contentType],
		references: [contentItems.id, contentItems.contentType]
	}),
	pageRevisions: many(pageRevisions),
}));

export const pageRevisionsRelations = relations(pageRevisions, ({ one, many }) => ({
	page: one(pages, {
		fields: [pageRevisions.pageContentItemId],
		references: [pages.contentItemId]
	}),
	mediaAsset: one(mediaAssets, {
		fields: [pageRevisions.ogImageMediaId],
		references: [mediaAssets.id]
	}),
	adminUser_createdBy: one(adminUsers, {
		fields: [pageRevisions.createdBy],
		references: [adminUsers.id],
		relationName: "pageRevisions_createdBy_adminUsers_id"
	}),
	adminUser_reviewedBy: one(adminUsers, {
		fields: [pageRevisions.reviewedBy],
		references: [adminUsers.id],
		relationName: "pageRevisions_reviewedBy_adminUsers_id"
	}),
	adminUser_publishedBy: one(adminUsers, {
		fields: [pageRevisions.publishedBy],
		references: [adminUsers.id],
		relationName: "pageRevisions_publishedBy_adminUsers_id"
	}),
	pageRevisionMedias: many(pageRevisionMedia),
}));

export const pageRevisionMediaRelations = relations(pageRevisionMedia, ({ one }) => ({
	pageRevision: one(pageRevisions, {
		fields: [pageRevisionMedia.revisionId],
		references: [pageRevisions.id]
	}),
	mediaAsset: one(mediaAssets, {
		fields: [pageRevisionMedia.mediaId],
		references: [mediaAssets.id]
	}),
}));

export const navigationItemsRelations = relations(navigationItems, ({ one, many }) => ({
	navigationMenu: one(navigationMenus, {
		fields: [navigationItems.menuId],
		references: [navigationMenus.id]
	}),
	contentItem: one(contentItems, {
		fields: [navigationItems.targetContentItemId],
		references: [contentItems.id]
	}),

	// Correct composite self-relation:
	// (menu_id, parent_item_id) -> (menu_id, id)
	parentItem: one(navigationItems, {
		fields: [navigationItems.menuId, navigationItems.parentItemId],
		references: [navigationItems.menuId, navigationItems.id],
		relationName: "navigationItems_menuId_navigationItems_id"
	}),

	childItems: many(navigationItems, {
		relationName: "navigationItems_menuId_navigationItems_id"
	}),
}));

export const navigationMenusRelations = relations(navigationMenus, ({ many }) => ({
	navigationItems: many(navigationItems),
}));

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
	adminUser: one(adminUsers, {
		fields: [siteSettings.updatedBy],
		references: [adminUsers.id]
	}),
}));

export const seoRedirectsRelations = relations(seoRedirects, ({ one }) => ({
	adminUser: one(adminUsers, {
		fields: [seoRedirects.createdBy],
		references: [adminUsers.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	adminUser: one(adminUsers, {
		fields: [auditLogs.actorUserId],
		references: [adminUsers.id]
	}),
}));

export const adminUserRolesRelations = relations(adminUserRoles, ({ one }) => ({
	adminUser: one(adminUsers, {
		fields: [adminUserRoles.adminUserId],
		references: [adminUsers.id]
	}),
	role: one(roles, {
		fields: [adminUserRoles.roleId],
		references: [roles.id]
	}),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	adminUserRoles: many(adminUserRoles),
	rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
	product: one(products, {
		fields: [productCategories.productId],
		references: [products.id]
	}),
	category: one(categories, {
		fields: [productCategories.categoryId],
		references: [categories.id]
	}),
}));

export const categoryAttributesRelations = relations(categoryAttributes, ({ one }) => ({
	category: one(categories, {
		fields: [categoryAttributes.categoryId],
		references: [categories.id]
	}),
	attribute: one(attributes, {
		fields: [categoryAttributes.attributeId],
		references: [attributes.id]
	}),
}));

export const attributesRelations = relations(attributes, ({ many }) => ({
	categoryAttributes: many(categoryAttributes),
	productAttributeValues: many(productAttributeValues),
}));

export const productAttributeValuesRelations = relations(productAttributeValues, ({ one }) => ({
	product: one(products, {
		fields: [productAttributeValues.productId],
		references: [products.id]
	}),
	attribute: one(attributes, {
		fields: [productAttributeValues.attributeId],
		references: [attributes.id]
	}),
}));

export const priceImportRowsRelations = relations(priceImportRows, ({ one }) => ({
	priceImportBatch: one(priceImportBatches, {
		fields: [priceImportRows.batchId],
		references: [priceImportBatches.id]
	}),
	product: one(products, {
		fields: [priceImportRows.productId],
		references: [products.id]
	}),
}));

export const priceListPublicationItemsRelations = relations(priceListPublicationItems, ({ one }) => ({
	priceListPublication: one(priceListPublications, {
		fields: [priceListPublicationItems.publicationId],
		references: [priceListPublications.id]
	}),
	product: one(products, {
		fields: [priceListPublicationItems.productId],
		references: [products.id]
	}),
}));
