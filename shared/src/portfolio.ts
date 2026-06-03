import { z } from 'zod';

// ---------------------------------------------------------------------------
//  Profile (singleton)
// ---------------------------------------------------------------------------
export const ProfileSchema = z.object({
  brandName: z.string().min(1).max(120),
  brandShortName: z.string().nullable(),
  tagline: z.string().nullable(),
  description: z.string().nullable(),
  logoMark: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  language: z.string().min(2).max(10).default('en'),
  locale: z.string().min(2).max(10).default('en_IN'),
  contact: z.record(z.unknown()).default({}),
  social: z.record(z.unknown()).default({}),
  seo: z.record(z.unknown()).default({}),
  analytics: z.record(z.unknown()).default({}),
  theme: z.record(z.unknown()).default({}),
  updatedAt: z.string().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

// Profile is a singleton — same shape for create / update
export const UpsertProfileSchema = ProfileSchema.partial({ updatedAt: true });
export type UpsertProfile = z.infer<typeof UpsertProfileSchema>;

// ---------------------------------------------------------------------------
//  Service
// ---------------------------------------------------------------------------
export const ServiceSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  code: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  icon: z.string().nullable(),
  tagline: z.string().nullable(),
  summary: z.string().nullable(),
  bullets: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export type Service = z.infer<typeof ServiceSchema>;

export const CreateServiceSchema = ServiceSchema.omit({ id: true }).partial({
  icon: true, tagline: true, summary: true, bullets: true, sortOrder: true, isActive: true,
});
export type CreateService = z.infer<typeof CreateServiceSchema>;

export const UpdateServiceSchema = CreateServiceSchema.partial();
export type UpdateService = z.infer<typeof UpdateServiceSchema>;

// ---------------------------------------------------------------------------
//  Project (case study)
// ---------------------------------------------------------------------------
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  client: z.string().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  summary: z.string().nullable(),
  bodyMd: z.string().nullable(),
  coverImage: z.string().nullable(),
  gallery: z.array(z.string()).default([]),
  externalUrl: z.string().url().nullable(),
  completedAt: z.string().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(false),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = ProjectSchema.omit({ id: true }).partial({
  client: true, category: true, tags: true, summary: true, bodyMd: true,
  coverImage: true, gallery: true, externalUrl: true, completedAt: true,
  sortOrder: true, isPublished: true,
});
export type CreateProject = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = CreateProjectSchema.partial();
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

// ---------------------------------------------------------------------------
//  Post (blog)
// ---------------------------------------------------------------------------
export const PostSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  description: z.string().nullable(),
  bodyMd: z.string().nullable(),
  coverImage: z.string().nullable(),
  publishedAt: z.string().nullable(),
  isPublished: z.boolean().default(false),
  readingMinutes: z.number().int().default(5),
});
export type Post = z.infer<typeof PostSchema>;

export const CreatePostSchema = PostSchema.omit({ id: true }).partial({
  category: true, tags: true, description: true, bodyMd: true, coverImage: true,
  publishedAt: true, isPublished: true, readingMinutes: true,
});
export type CreatePost = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = CreatePostSchema.partial();
export type UpdatePost = z.infer<typeof UpdatePostSchema>;

export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  category: z.string().optional(),
  tag: z.string().optional(),
});
export type PostListQuery = z.infer<typeof PostListQuerySchema>;

// ---------------------------------------------------------------------------
//  Testimonial
// ---------------------------------------------------------------------------
export const TestimonialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  role: z.string().nullable(),
  quote: z.string().min(1),
  initials: z.string().nullable(),
  rating: z.number().int().min(1).max(5).default(5),
  sortOrder: z.number().int().default(0),
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

export const CreateTestimonialSchema = TestimonialSchema.omit({ id: true }).partial({
  role: true, initials: true, rating: true, sortOrder: true,
});
export type CreateTestimonial = z.infer<typeof CreateTestimonialSchema>;

export const UpdateTestimonialSchema = CreateTestimonialSchema.partial();
export type UpdateTestimonial = z.infer<typeof UpdateTestimonialSchema>;

// ---------------------------------------------------------------------------
//  FAQ
// ---------------------------------------------------------------------------
export const FaqSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.number().int().default(0),
});
export type Faq = z.infer<typeof FaqSchema>;

export const CreateFaqSchema = FaqSchema.omit({ id: true }).partial({ sortOrder: true });
export type CreateFaq = z.infer<typeof CreateFaqSchema>;

export const UpdateFaqSchema = CreateFaqSchema.partial();
export type UpdateFaq = z.infer<typeof UpdateFaqSchema>;

// ---------------------------------------------------------------------------
//  Team member
// ---------------------------------------------------------------------------
export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  role: z.string().nullable(),
  bio: z.string().nullable(),
  avatar: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  sortOrder: z.number().int().default(0),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const CreateTeamMemberSchema = TeamMemberSchema.omit({ id: true }).partial({
  role: true, bio: true, avatar: true, avatarUrl: true, sortOrder: true,
});
export type CreateTeamMember = z.infer<typeof CreateTeamMemberSchema>;

export const UpdateTeamMemberSchema = CreateTeamMemberSchema.partial();
export type UpdateTeamMember = z.infer<typeof UpdateTeamMemberSchema>;

// ---------------------------------------------------------------------------
//  Combined "landing" payload (returned by GET /portfolio/landing)
// ---------------------------------------------------------------------------
export const LandingSchema = z.object({
  profile: ProfileSchema,
  services: z.array(ServiceSchema),
  projects: z.array(ProjectSchema),
  posts: z.array(PostSchema),
  testimonials: z.array(TestimonialSchema),
  faq: z.array(FaqSchema),
  team: z.array(TeamMemberSchema),
});
export type Landing = z.infer<typeof LandingSchema>;
