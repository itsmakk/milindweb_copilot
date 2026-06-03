You are a senior full-stack software architect.
Build this project using clean, production-ready, industry-standard architecture.
━━━━━━━━━━━━━━━━━━━━━━━
GENERAL PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━
The application must work in any environment with minimal changes.
Avoid vendor lock-in.
Follow standard coding practices and open standards.
Use reusable, modular, maintainable code.
Follow DRY (Don't Repeat Yourself) principles and avoid duplicate code.
Keep business logic separate from UI.
Keep configuration separate from code.
Provide clear project structure, naming conventions, and folder organization suitable for long-term maintenance and team development.
Before implementing new functionality, analyze the existing architecture and reuse existing components, services, utilities, styles, configurations, and patterns whenever possible.
Do not create duplicate implementations of existing functionality. Extend or reuse existing modules unless there is a clear architectural reason not to do so.
━━━━━━━━━━━━━━━━━━━━━━━
CORE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━
1.1 The application must work in any environment with minimal changes.
1.2 Avoid vendor lock-in.
1.3 Follow standard coding practices and open standards.
1.4 Use reusable, modular, maintainable code.
1.5 Keep business logic separate from UI.
1.6 Keep configuration separate from code.
━━━━━━━━━━━━━━━━━━━━━━━
2. ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━
2.1 Frontend, backend, authentication, database, storage, and configuration must be loosely coupled.
2.2 The project should be deployable on Cloudflare Pages, GitHub Pages, Vercel, Render, Railway, VPS, Docker, Coolify, self-hosted servers, or any compatible environment.
2.3 Database and authentication providers should be replaceable with minimal code changes.
2.4 Use standard authentication patterns and keep authentication providers replaceable.
2.5 Use environment/configuration files for all settings.
2.6 Build the application using independent, modular, and reusable components.
2.7 Any page, section, feature, module, service, or system should be able to be added, removed, enabled, disabled, or replaced without affecting other parts of the application.
2.8 Avoid tight coupling between modules.
2.9 Design modules as plug-and-play components whenever possible.
2.10 The application must support containerized deployment using Docker.
2.11 Provide Docker and Docker Compose configurations for local development and production deployment.
2.12 The application should be deployable through Coolify without requiring code changes.
2.13 Avoid platform-specific code or configurations that would prevent deployment on Docker, VPS, cloud platforms, or self-hosted environments.
2.14 All services should communicate through configurable environment variables and standard interfaces.
2.15 The application should support migration between cloud-hosted and self-hosted infrastructure with minimal changes.
━━━━━━━━━━━━━━━━━━━━━━━
3. BRANDING & SEO
━━━━━━━━━━━━━━━━━━━━━━━
3.1 Do not hardcode website name, client name, domain name, company details, contact information, SEO titles, meta descriptions, canonical URLs, sitemap URLs, logos, branding, or social links.
3.2 Do not hardcode page titles, navigation menus, footer content, email addresses, phone numbers, social media links, colors, themes, permissions, roles, feature flags, business rules, or application settings.
3.3 Keep all branding, content, SEO, and business information in one central configuration.
3.4 The same codebase should support multiple clients by changing configuration only.
3.5 Internal links should be domain-independent whenever possible.
3.6 Internal navigation should use relative links whenever possible.
3.7 SEO configuration should be centrally managed and reusable across projects.
3.8 Canonical URLs, sitemap URLs, robots.txt entries, and SEO links should be generated dynamically.
━━━━━━━━━━━━━━━━━━━━━━━
4. UI & DESIGN
━━━━━━━━━━━━━━━━━━━━━━━
4.1 Modern, responsive, mobile-first design.
4.2 Reusable components.
4.3 Centralized CSS and theme system.
4.4 Shared header, footer, navigation, contact forms, branding, layouts, and common UI components.
4.5 Consistent card/grid design across the entire website.
4.6 Keep CSS centralized and reusable.
4.7 Avoid page-specific CSS where possible.
4.8 Changes to styling should be manageable from a central theme/configuration system.
4.9 Header, footer, navigation, branding, contact information, and layouts should be managed from a single source and automatically reflected throughout the application.
━━━━━━━━━━━━━━━━━━━━━━━
5. SECURITY
━━━━━━━━━━━━━━━━━━━━━━━
5.1 Role-based permissions.
5.2 Secure authentication.
5.3 Secure API access.
5.4 Input validation and sanitization.
5.5 Follow OWASP security practices(for financial projects only). 
5.5a Implement reasonable security best practices suitable for the application. Prioritize protection against common vulnerabilities while maintaining simplicity, performance, and ease of maintenance.

5.6 Use secure secrets management through environment variables and never hardcode credentials, API keys, tokens, passwords, database connections, or private keys.
5.7 Follow the principle of least privilege for users, roles, APIs, and services.
━━━━━━━━━━━━━━━━━━━━━━━
6. SCALABILITY
━━━━━━━━━━━━━━━━━━━━━━━
6.1 Design so new modules, pages, systems, and clients can be added without major refactoring.
6.2 Support future migration between databases, authentication providers, hosting platforms, and domains.
6.3 The same codebase should be reusable for different clients, domains, projects, businesses, and organizations with minimal changes.
6.4 Architecture should support future expansion without requiring structural redesign.
━━━━━━━━━━━━━━━━━━━━━━━
7. DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━
7.1 Clearly document project structure, deployment process, configuration, environment variables, database schema, and authentication flow.
7.2 Document module structure, dependencies, and extension points for future development.
━━━━━━━━━━━━━━━━━━━━━━━
8. REUSABILITY & MULTI-CLIENT SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━
8.1 The same codebase must support multiple clients, businesses, organizations, and projects.
8.2 Client-specific settings must be configurable without code changes.
8.3 Branding, themes, colors, logos, SEO, menus, contact information, permissions, and business details must be configurable.
8.4 New clients should be onboarded by updating configuration only.
━━━━━━━━━━━━━━━━━━━━━━━
9. MAINTAINABILITY
━━━━━━━━━━━━━━━━━━━━━━━
9.1 Removing a page must not break other pages.
9.2 Removing a feature, section, service, or module must not affect unrelated modules.
9.3 Adding new modules must require minimal changes to existing code.
9.4 Shared functionality should be reused instead of duplicated.
9.5 Header, footer, navigation, CSS, branding, SEO, and configuration should remain unaffected when pages are added, removed, or modified.
━━━━━━━━━━━━━━━━━━━━━━━
10. DOMAIN INDEPENDENCE
━━━━━━━━━━━━━━━━━━━━━━━
10.1 Do not hardcode domains or URLs anywhere in the codebase.
10.2 All domains, subdomains, URLs, API endpoints, and external service configurations must be configurable.
10.3 The project should support domain changes with minimal configuration updates.
━━━━━━━━━━━━━━━━━━━━━━━
11. PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━
11.1 Use lazy loading where appropriate.
11.2 Optimize assets, images, fonts, and API requests.
11.3 Minimize bundle size and unnecessary dependencies.
11.4 Design for good Core Web Vitals and SEO performance.
━━━━━━━━━━━━━━━━━━━━━━━
12. Use
━━━━━━━━━━━━━━━━━━━━━━━
use Framer Motion is the animation library 
use the UI UX Pro Max Skill if req
use graphify github repo if req
━━━━━━━━━━━━━━━━━━━━━━━
13. DATA PORTABILITY
━━━━━━━━━━━━━━━━━━━━━━━
13.1 Database schema and data should be exportable and importable.
13.2 Avoid proprietary data formats where possible.
13.3 Support backup and restore procedures.
━━━━━━━━━━━━━━━━━━━━━━━
14. API DESIGN
━━━━━━━━━━━━━━━━━━━━━━━
14.1 Use versioned APIs when applicable.
14.2 Follow REST/OpenAPI standards (or clearly documented alternatives).
14.3 Avoid frontend dependence on database structure.
━━━━━━━━━━━━━━━━━━━━━━━
15. FINANCIAL SYSTEM RULES (APPLY ONLY TO ACCOUNTING / SOCIETY SOFTWARE) (Not use)
━━━━━━━━━━━━━━━━━━━━━━━
15.1 Follow SRS 100% (no skipping, no simplification).
15.2 Ledger-driven architecture (no direct balance storage).
15.3 No delete → reversal only.
15.4 Full audit trail (append-only).
15.5 Month locking mandatory.
15.6 Financial accuracy is critical.
15.7 Generate schema strictly as per SRS.
15.8 Enforce transaction safety, audit logs, and no-delete policies.
15.9 Support backup, restore, exports, and financial validation.
━━━━━━━━━━━━━━━━━━━━━━━
16. PROJECT TRACKING
━━━━━━━━━━━━━━━━━━━━━━━
16.1 Maintain status.md.
16.2 Track completed tasks.
16.3 Track pending tasks.
16.4 Track current phase.
16.5 Track next steps.
16.6 Track deployment status.
16.7 Track errors and fixes.
16.8 Maintain version history.
16.9 Track bug reports and resolutions.
16.10 Maintain recent changes log.
━━━━━━━━━━━━━━━━━━━━━━━
17. AI EXECUTION RULES
━━━━━━━━━━━━━━━━━━━━━━━
17.1 Work in phases whenever the project is large.
17.2 Review existing architecture before creating new code.
17.3 Reuse existing components before creating new ones.
17.4 Use repository indexing, project memory, dependency mapping, code search, and project context tracking when available to reduce token usage and avoid re-analyzing unchanged files.
17.5 Stop after completing the requested phase and provide a status report.

━━━━━━━━━━━━━━━━━━━━━━━
18. GOAL
━━━━━━━━━━━━━━━━━━━━━━━
18.1 Create a future-proof, reusable digital platform that can be deployed for different clients, domains, and environments while maintaining clean architecture, security, scalability, easy migration, maintainability, and long-term flexibility.


####### Website content ###
Home | About | Services | Blog | Contact | Login
Services
1. Digital Marketing & SEO
Improve online visibility, attract qualified leads, and grow your business through Search Engine Optimization (SEO), Google Ads, social media marketing, content marketing, local SEO, and performance-driven digital strategies designed to deliver measurable results.

2. Website Development
Design and develop modern, responsive, SEO-friendly websites, landing pages, business portals, and custom web applications that prioritize performance, security, scalability, and user experience.

3. Business Automation
Digitize and streamline business operations through custom software solutions including Hospital Management Systems, Clinic Management Systems, Society Management Software, Seniority Management Platforms, Member Portals, workflow automation, reporting systems, and business process digitization.

4. Engineering Projects & Technical Training
Industry-oriented engineering and technology solutions including IoT, embedded systems, robotics, industrial automation, PLC/SCADA, AI/ML projects, website development, software solutions, automation tools, technical documentation, workshops, apprentice training, industrial training, and skill development programs for students, professionals, and organizations.


5. Photography, Videography & Drone Services
Professional photography and videography services for events, businesses, products, and promotional campaigns. Services include event coverage, drone photography, drone videography, aerial inspections, cinematic shoots, camera rental, and drone equipment rental.


6. Graphics & Branding
Create a strong visual identity through professional logo design, business branding, marketing materials, social media creatives, promotional graphics, advertisements, presentations, and professional video editing services.

7. Electrical Services
Professional electrical installation, maintenance, troubleshooting, and repair services for residential, commercial, and industrial applications. Services include wiring, panel installation, preventive maintenance, industrial electrical work, energy-efficient solutions, and solar power system installation and support.

8. Automotive Services
Comprehensive two-wheeler maintenance and repair services including routine servicing, diagnostics, engine repairs, electrical troubleshooting, preventive maintenance, and electric two-wheeler repair and servicing.


For contact form use my google app script already working as it is script and js.
Use my social media and contact details(not hardcoded)



These below use old we will build later because it req Postgreql auth , later we will design from start.

Blog
Seniarity_Management
Seniariity_List
Hospital Manager (form.html)

