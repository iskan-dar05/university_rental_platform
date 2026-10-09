This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication and database

Keep the existing Neon `DATABASE_URL` in `.env`, and add `AUTH_SECRET` with a private random value. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Do not replace an existing database URL with a placeholder.

The portal uses NextAuth Credentials with JWT sessions. New student and faculty accounts are stored with bcrypt password hashes and start with `pending` status; an administrator must approve them before they can request equipment. The Drizzle schema includes users, equipment, and bookings. Booking requests are reviewed by staff, who record approval, pickup, overdue status, and return. This portal does not collect payments.

To provision the first administrator, create and verify an account through sign-up, then promote that account directly in Neon:

```sql
UPDATE users
SET role = 'admin', status = 'active', "updatedAt" = now()
WHERE email = 'admin@your-university.edu';
```

Admin access is never granted through public sign-up. Administrators can approve, suspend, and restore non-admin accounts, manage equipment listings, and process bookings.

Generate and apply schema migrations with:

```bash
npm run db:generate
npm run db:migrate
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# university_rental_platform" 
