/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

/**
 * Portfolio schema — read-mostly CMS that backs the static site.
 * All tables support soft-delete + audit, but reads are the hot path.
 */
exports.up = (pgm) => {
  pgm.createSchema('portfolio', { ifNotExists: true });
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createFunction(
    'portfolio',
    'set_updated_at',
    [],
    { returns: 'trigger', language: 'plpgsql', replace: true },
    'BEGIN NEW.updated_at = now(); RETURN NEW; END;',
  );

  // -------- profile (singleton) -----------------------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'profile' },
    {
      id: { type: 'integer', primaryKey: true, default: 1, check: 'id = 1' },
      brand_name: { type: 'citext', notNull: true },
      brand_short_name: { type: 'citext' },
      tagline: { type: 'citext' },
      description: { type: 'text' },
      logo_mark: { type: 'citext' },
      founded_year: { type: 'integer' },
      language: { type: 'citext', notNull: true, default: 'en' },
      locale: { type: 'citext', notNull: true, default: 'en_IN' },
      contact: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      social: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      seo: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      analytics: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      theme: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.sql(`CREATE TRIGGER trg_portfolio_profile_updated_at BEFORE UPDATE ON portfolio.profile FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();`);

  // -------- services ----------------------------------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'services' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      slug: { type: 'citext', notNull: true, unique: true },
      code: { type: 'citext', notNull: true, unique: true },   // e.g. "digital-marketing"
      title: { type: 'citext', notNull: true },
      icon: { type: 'citext' },                                // Font Awesome class
      tagline: { type: 'citext' },
      summary: { type: 'text' },
      bullets: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      sort_order: { type: 'integer', notNull: true, default: 0 },
      is_active: { type: 'boolean', notNull: true, default: true },
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.sql(`CREATE TRIGGER trg_portfolio_services_updated_at BEFORE UPDATE ON portfolio.services FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();`);

  // -------- projects ----------------------------------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'projects' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      slug: { type: 'citext', notNull: true, unique: true },
      title: { type: 'citext', notNull: true },
      client: { type: 'citext' },
      category: { type: 'citext' },
      tags: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      summary: { type: 'text' },
      body_md: { type: 'text' },
      cover_image: { type: 'citext' },
      gallery: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      external_url: { type: 'citext' },
      completed_at: { type: 'date' },
      sort_order: { type: 'integer', notNull: true, default: 0 },
      is_published: { type: 'boolean', notNull: true, default: false },
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'portfolio', name: 'projects' }, 'is_published', { where: 'is_published = true AND is_deleted = false', name: 'idx_portfolio_projects_published' });
  pgm.sql(`CREATE TRIGGER trg_portfolio_projects_updated_at BEFORE UPDATE ON portfolio.projects FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();`);

  // -------- posts (blog) -----------------------------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'posts' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      slug: { type: 'citext', notNull: true, unique: true },
      title: { type: 'citext', notNull: true },
      category: { type: 'citext' },
      tags: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      description: { type: 'text' },
      body_md: { type: 'text' },
      cover_image: { type: 'citext' },
      published_at: { type: 'timestamptz' },
      is_published: { type: 'boolean', notNull: true, default: false },
      reading_minutes: { type: 'integer', default: 5 },
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'portfolio', name: 'posts' }, 'published_at', { where: 'is_published = true AND is_deleted = false', name: 'idx_portfolio_posts_published' });
  pgm.createIndex({ schema: 'portfolio', name: 'posts' }, 'category', { where: 'is_published = true', name: 'idx_portfolio_posts_category' });
  pgm.sql(`CREATE TRIGGER trg_portfolio_posts_updated_at BEFORE UPDATE ON portfolio.posts FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();`);

  // -------- testimonials ------------------------------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'testimonials' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      name: { type: 'citext', notNull: true },
      role: { type: 'citext' },
      quote: { type: 'text', notNull: true },
      initials: { type: 'citext' },
      rating: { type: 'integer', notNull: true, default: 5, check: 'rating BETWEEN 1 AND 5' },
      sort_order: { type: 'integer', notNull: true, default: 0 },
      is_active: { type: 'boolean', notNull: true, default: true },
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.sql(`CREATE TRIGGER trg_portfolio_testimonials_updated_at BEFORE UPDATE ON portfolio.testimonials FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();`);

  // -------- faq ---------------------------------------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'faq' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      question: { type: 'citext', notNull: true },
      answer: { type: 'text', notNull: true },
      sort_order: { type: 'integer', notNull: true, default: 0 },
      is_active: { type: 'boolean', notNull: true, default: true },
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.sql(`CREATE TRIGGER trg_portfolio_faq_updated_at BEFORE UPDATE ON portfolio.faq FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();`);

  // -------- team --------------------------------------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'team' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      name: { type: 'citext', notNull: true },
      role: { type: 'citext' },
      bio: { type: 'text' },
      avatar: { type: 'citext' },                       // single letter or URL
      avatar_url: { type: 'citext' },
      sort_order: { type: 'integer', notNull: true, default: 0 },
      is_active: { type: 'boolean', notNull: true, default: true },
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.sql(`CREATE TRIGGER trg_portfolio_team_updated_at BEFORE UPDATE ON portfolio.team FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();`);

  // -------- audit (admin actions on portfolio) -------------------------
  pgm.createTable(
    { schema: 'portfolio', name: 'audit_log' },
    {
      id: { type: 'bigserial', primaryKey: true },
      actor_id: { type: 'citext' },
      actor_role: { type: 'citext' },
      action: { type: 'citext', notNull: true },
      entity: { type: 'citext', notNull: true },
      entity_id: { type: 'citext' },
      meta: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      ip: { type: 'inet' },
      user_agent: { type: 'text' },
      request_id: { type: 'citext' },
      at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'portfolio', name: 'audit_log' }, ['entity', 'entity_id'], { name: 'idx_portfolio_audit_entity' });
};

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'portfolio', name: 'audit_log' }, { ifExists: true });
  pgm.dropTable({ schema: 'portfolio', name: 'team' }, { ifExists: true });
  pgm.dropTable({ schema: 'portfolio', name: 'faq' }, { ifExists: true });
  pgm.dropTable({ schema: 'portfolio', name: 'testimonials' }, { ifExists: true });
  pgm.dropTable({ schema: 'portfolio', name: 'posts' }, { ifExists: true });
  pgm.dropTable({ schema: 'portfolio', name: 'projects' }, { ifExists: true });
  pgm.dropTable({ schema: 'portfolio', name: 'services' }, { ifExists: true });
  pgm.dropTable({ schema: 'portfolio', name: 'profile' }, { ifExists: true });
  pgm.dropFunction({ schema: 'portfolio', name: 'set_updated_at' }, [], { ifExists: true });
  pgm.dropSchema('portfolio', { ifExists: true, cascade: true });
};
