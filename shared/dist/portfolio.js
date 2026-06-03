"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandingSchema = exports.UpdateTeamMemberSchema = exports.CreateTeamMemberSchema = exports.TeamMemberSchema = exports.UpdateFaqSchema = exports.CreateFaqSchema = exports.FaqSchema = exports.UpdateTestimonialSchema = exports.CreateTestimonialSchema = exports.TestimonialSchema = exports.PostListQuerySchema = exports.UpdatePostSchema = exports.CreatePostSchema = exports.PostSchema = exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.ProjectSchema = exports.UpdateServiceSchema = exports.CreateServiceSchema = exports.ServiceSchema = exports.UpsertProfileSchema = exports.ProfileSchema = void 0;
const zod_1 = require("zod");
// ---------------------------------------------------------------------------
//  Profile (singleton)
// ---------------------------------------------------------------------------
exports.ProfileSchema = zod_1.z.object({
    brandName: zod_1.z.string().min(1).max(120),
    brandShortName: zod_1.z.string().nullable(),
    tagline: zod_1.z.string().nullable(),
    description: zod_1.z.string().nullable(),
    logoMark: zod_1.z.string().nullable(),
    foundedYear: zod_1.z.number().int().nullable(),
    language: zod_1.z.string().min(2).max(10).default('en'),
    locale: zod_1.z.string().min(2).max(10).default('en_IN'),
    contact: zod_1.z.record(zod_1.z.unknown()).default({}),
    social: zod_1.z.record(zod_1.z.unknown()).default({}),
    seo: zod_1.z.record(zod_1.z.unknown()).default({}),
    analytics: zod_1.z.record(zod_1.z.unknown()).default({}),
    theme: zod_1.z.record(zod_1.z.unknown()).default({}),
    updatedAt: zod_1.z.string().optional(),
});
// Profile is a singleton — same shape for create / update
exports.UpsertProfileSchema = exports.ProfileSchema.partial({ updatedAt: true });
// ---------------------------------------------------------------------------
//  Service
// ---------------------------------------------------------------------------
exports.ServiceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1).max(60),
    title: zod_1.z.string().min(1).max(120),
    icon: zod_1.z.string().nullable(),
    tagline: zod_1.z.string().nullable(),
    summary: zod_1.z.string().nullable(),
    bullets: zod_1.z.array(zod_1.z.string()).default([]),
    sortOrder: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
});
exports.CreateServiceSchema = exports.ServiceSchema.omit({ id: true }).partial({
    icon: true, tagline: true, summary: true, bullets: true, sortOrder: true, isActive: true,
});
exports.UpdateServiceSchema = exports.CreateServiceSchema.partial();
// ---------------------------------------------------------------------------
//  Project (case study)
// ---------------------------------------------------------------------------
exports.ProjectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    client: zod_1.z.string().nullable(),
    category: zod_1.z.string().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    summary: zod_1.z.string().nullable(),
    bodyMd: zod_1.z.string().nullable(),
    coverImage: zod_1.z.string().nullable(),
    gallery: zod_1.z.array(zod_1.z.string()).default([]),
    externalUrl: zod_1.z.string().url().nullable(),
    completedAt: zod_1.z.string().nullable(),
    sortOrder: zod_1.z.number().int().default(0),
    isPublished: zod_1.z.boolean().default(false),
});
exports.CreateProjectSchema = exports.ProjectSchema.omit({ id: true }).partial({
    client: true, category: true, tags: true, summary: true, bodyMd: true,
    coverImage: true, gallery: true, externalUrl: true, completedAt: true,
    sortOrder: true, isPublished: true,
});
exports.UpdateProjectSchema = exports.CreateProjectSchema.partial();
// ---------------------------------------------------------------------------
//  Post (blog)
// ---------------------------------------------------------------------------
exports.PostSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    category: zod_1.z.string().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    description: zod_1.z.string().nullable(),
    bodyMd: zod_1.z.string().nullable(),
    coverImage: zod_1.z.string().nullable(),
    publishedAt: zod_1.z.string().nullable(),
    isPublished: zod_1.z.boolean().default(false),
    readingMinutes: zod_1.z.number().int().default(5),
});
exports.CreatePostSchema = exports.PostSchema.omit({ id: true }).partial({
    category: true, tags: true, description: true, bodyMd: true, coverImage: true,
    publishedAt: true, isPublished: true, readingMinutes: true,
});
exports.UpdatePostSchema = exports.CreatePostSchema.partial();
exports.PostListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(50).default(10),
    category: zod_1.z.string().optional(),
    tag: zod_1.z.string().optional(),
});
// ---------------------------------------------------------------------------
//  Testimonial
// ---------------------------------------------------------------------------
exports.TestimonialSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(120),
    role: zod_1.z.string().nullable(),
    quote: zod_1.z.string().min(1),
    initials: zod_1.z.string().nullable(),
    rating: zod_1.z.number().int().min(1).max(5).default(5),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.CreateTestimonialSchema = exports.TestimonialSchema.omit({ id: true }).partial({
    role: true, initials: true, rating: true, sortOrder: true,
});
exports.UpdateTestimonialSchema = exports.CreateTestimonialSchema.partial();
// ---------------------------------------------------------------------------
//  FAQ
// ---------------------------------------------------------------------------
exports.FaqSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    question: zod_1.z.string().min(1),
    answer: zod_1.z.string().min(1),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.CreateFaqSchema = exports.FaqSchema.omit({ id: true }).partial({ sortOrder: true });
exports.UpdateFaqSchema = exports.CreateFaqSchema.partial();
// ---------------------------------------------------------------------------
//  Team member
// ---------------------------------------------------------------------------
exports.TeamMemberSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(120),
    role: zod_1.z.string().nullable(),
    bio: zod_1.z.string().nullable(),
    avatar: zod_1.z.string().nullable(),
    avatarUrl: zod_1.z.string().url().nullable(),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.CreateTeamMemberSchema = exports.TeamMemberSchema.omit({ id: true }).partial({
    role: true, bio: true, avatar: true, avatarUrl: true, sortOrder: true,
});
exports.UpdateTeamMemberSchema = exports.CreateTeamMemberSchema.partial();
// ---------------------------------------------------------------------------
//  Combined "landing" payload (returned by GET /portfolio/landing)
// ---------------------------------------------------------------------------
exports.LandingSchema = zod_1.z.object({
    profile: exports.ProfileSchema,
    services: zod_1.z.array(exports.ServiceSchema),
    projects: zod_1.z.array(exports.ProjectSchema),
    posts: zod_1.z.array(exports.PostSchema),
    testimonials: zod_1.z.array(exports.TestimonialSchema),
    faq: zod_1.z.array(exports.FaqSchema),
    team: zod_1.z.array(exports.TeamMemberSchema),
});
//# sourceMappingURL=portfolio.js.map