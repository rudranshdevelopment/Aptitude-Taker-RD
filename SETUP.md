# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- npm or yarn package manager

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a random secret (e.g., `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Your app URL (e.g., `http://localhost:3000`)
   - Email settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
   - `APP_URL`: Your app URL

3. **Set Up Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed Admin User**
   ```bash
   npm run seed
   ```
   
   This creates an admin user:
   - Email: `admin@rudransh.dev`
   - Password: `admin123`
   
   **Important**: Change the password after first login!

5. **Create Uploads Directory**
   ```bash
   mkdir -p uploads/recordings
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Open http://localhost:3000
   - Login at http://localhost:3000/admin/login
   - Use the credentials from step 4

## Creating Your First Test

1. Login as admin
2. Go to "Tests" → "Create New Test"
3. Fill in test details and configure proctoring settings
4. Add questions to your test
5. Assign the test to candidates via email or generate a link
6. Share the invite link with candidates

## Production Deployment

### Environment Variables for Production

Make sure to set:
- Strong `NEXTAUTH_SECRET`
- Production `DATABASE_URL`
- Production email settings
- `APP_URL` to your production domain
- Consider using S3 for video storage instead of local uploads

### Database Migrations

For production, use migrations:
```bash
npx prisma migrate deploy
```

### Video Storage

For production, configure AWS S3 or similar:
- Update the recording upload endpoint to use S3
- Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` in `.env`

## Troubleshooting

### Camera Not Working
- Ensure HTTPS in production (required for camera access)
- Check browser permissions
- Test in Chrome (recommended browser)

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network/firewall settings

### Email Not Sending
- Verify SMTP credentials
- Check spam folder
- Test with a service like SendGrid or Postmark

## Security Notes

- Always use HTTPS in production
- Change default admin password
- Use strong `NEXTAUTH_SECRET`
- Regularly update dependencies
- Review and configure CORS if needed
- Set up proper backup for database

