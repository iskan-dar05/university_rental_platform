
# University Rental Platform

A university equipment rental portal built with Next.js, TypeScript, Drizzle ORM, and Neon PostgreSQL. The platform allows students and faculty to browse campus equipment, request rentals, and track bookings, while administrators manage users, equipment, and rental requests.

## Features

### Equipment Catalog
- Browse available campus equipment by category.
- View equipment details, descriptions, images, and included accessories.
- Display daily rental prices and availability.
- Load equipment listings dynamically from PostgreSQL.

### Authentication and User Management
- Sign up and sign in using email and password.
- Secure password storage using bcrypt hashes.
- JWT-based sessions using NextAuth.
- Student and faculty accounts require administrator approval.
- Account status management, including approval and suspension.

### Equipment Booking
- Select pickup and return dates.
- Add an optional project note.
- Submit equipment rental requests.
- Track booking status and rental information.
- Support booking review, approval, pickup, overdue tracking, and returns.

### Administration
- Approve pending user accounts.
- Suspend and restore eligible accounts.
- Create and manage equipment listings.
- Review and process equipment booking requests.
- Manage equipment availability and rental records.

### Database
- PostgreSQL database hosted on Neon.
- Database queries and schema management with Drizzle ORM.
- Relational data models for users, equipment, and bookings.
- UUID primary keys and foreign key relationships.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web application |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS / CSS | Styling |
| Drizzle ORM | Database queries and schema |
| Neon PostgreSQL | Database hosting |
| NextAuth.js | Authentication and sessions |
| bcryptjs | Password hashing |
| Lucide React | Icons |

## Project Structure

```text
public-portal/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── catalog/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── my-rentals/
│   │   └── page.tsx
│   ├── login/
│   ├── signup/
│   ├── admin/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── portal-shell.tsx
│   └── ...
├── database/
│   ├── drizzle.ts
│   └── schema.ts
├── migrations/
├── scripts/
│   └── seed-gear.ts
├── auth.ts
├── drizzle.config.ts
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

*This is a representative structure. Your actual directories may differ.*

## Getting Started

### 1. Prerequisites

Install the following:

- Node.js (a current supported LTS version)
- npm
- A Neon PostgreSQL account and database
- Git

### 2. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd public-portal
```

Replace `<YOUR_REPOSITORY_URL>` with your repository URL.

If you already have the project locally, open its root directory instead.

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="YOUR_NEON_POSTGRESQL_CONNECTION_STRING"
AUTH_SECRET="YOUR_PRIVATE_RANDOM_SECRET"
```

Get your PostgreSQL connection string from your Neon dashboard.

Generate an authentication secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the generated value into `AUTH_SECRET`.

**Security notes:**
- Never commit `.env.local` to Git.
- Never publish your database credentials or authentication secret.
- Do not replace your real database connection string with a placeholder when configuring your local environment.
- Use separate environment variables for development and production when appropriate.

### 5. Configure the Database

Ensure your `drizzle.config.ts` loads `.env.local`:

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Your database connection module should use the Neon connection string from `DATABASE_URL`.

### 6. Apply Database Migrations

If the project contains the `db:generate` and `db:migrate` scripts, run:

```bash
npm run db:generate
npm run db:migrate
```

Review generated migrations before applying them, particularly when working with an existing database.

If you use `drizzle-kit push` for development instead, run:

```bash
npx drizzle-kit push
```

Use the migration workflow consistently for production deployments.

### 7. Seed Equipment Data

If your project includes the equipment seed script and the `db:seed` command, run:

```bash
npm run db:seed
```

This inserts or updates the initial equipment listings in PostgreSQL.

Run the seed script carefully after real rentals have begun. Confirm that it does not overwrite live inventory values or other operational data.

### 8. Start the Development Server

```bash
npm run dev
```

Open the application at:

http://localhost:3000

The application will reload as you edit your source files.

## Database Models

### Users

Stores account and authentication information.

Typical fields include:
- `id`
- `fullName`
- `email`
- `universityId`
- `passwordHash`
- `role`
- `status`
- `createdAt`
- `updatedAt`

### Equipment

Stores equipment available for rental.

Typical fields include:
- `id`
- `slug`
- `name`
- `category`
- `description`
- `dailyRateCents`
- `availableCount`
- `condition`
- `imageUrl`
- `alt`
- `includes`
- `isActive`

### Bookings

Stores rental requests and their lifecycle.

Typical fields include:
- `id`
- `userId`
- `equipmentId`
- `startAt`
- `returnAt`
- `status`
- `projectNote`
- `estimatedTotalCents`
- `createdAt`
- `updatedAt`

Booking records reference users and equipment through their database UUIDs.

## Authentication and Authorization

The application uses NextAuth Credentials authentication with JWT sessions.

- Passwords are stored as bcrypt hashes, not plaintext.
- New student and faculty accounts begin with `pending` status.
- Pending or inactive accounts must not be allowed to submit rental requests.
- Administrator permissions must be verified on the server.
- Public registration must never allow users to assign themselves the administrator role.

### Provision the First Administrator

First, create an account through the application's sign-up flow and verify the email address if your authentication workflow requires it.

Then promote that account using the Neon SQL Editor:

```sql
UPDATE users
SET
  role = 'admin',
  status = 'active',
  "updatedAt" = now()
WHERE email = 'admin@your-university.edu';
```

Replace the email with the actual account email.

Only perform this operation as an authorized database administrator. Verify that exactly the intended account was updated.

## Booking Workflow

A typical rental workflow is:

1. A student or faculty member signs in.
2. The user browses the equipment catalog.
3. The user selects equipment and rental dates.
4. The user submits a booking request.
5. An administrator reviews the request.
6. The request is approved or rejected.
7. Staff record equipment pickup and return.
8. The booking status is updated as the rental progresses.

The backend should validate rental dates, availability, authorization, and pricing before creating a booking. Inventory updates must account for overlapping bookings and concurrent requests.

## Available Scripts

The exact commands depend on your `package.json`.

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run lint checks, if configured |
| `npm run db:generate` | Generate database migrations, if configured |
| `npm run db:migrate` | Apply database migrations, if configured |
| `npm run db:seed` | Seed equipment data, if configured |

## Deployment

The application can be deployed to Vercel or another compatible Node.js hosting platform.

Before deploying:

1. Configure `DATABASE_URL` and `AUTH_SECRET` in the hosting provider's environment settings.
2. Apply database migrations.
3. Ensure production database access is configured securely.
4. Verify authentication callbacks and session handling.
5. Test administrator authorization and booking permissions.
6. Run a production build:

```bash
npm run build
```

7. Deploy the application and test the production URL.

Never include secrets in source code, client-side environment variables, or public repository files.

## Payments

This platform manages equipment rental requests and does not collect payments.

## Contributing

1. Create a branch for your changes.
2. Implement and test your changes.
3. Review database migrations and authorization rules.
4. Submit a pull request with a clear description.

## License

Add the appropriate license for your project before distributing it publicly.
