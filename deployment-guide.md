# KMI Services Quote Form - Deployment Guide

This guide provides instructions for deploying the KMI Services Quote Form application to a cloud hosting platform and integrating it with your GoDaddy website.

## Deployment Options

### Option 1: Vercel Deployment (Recommended)

Vercel is a cloud platform optimized for Next.js applications with a generous free tier.

1. **Create a Vercel Account**:
   - Go to [vercel.com](https://vercel.com) and sign up for a free account
   - You can sign up using GitHub, GitLab, or email

2. **Deploy the Application**:
   - Click "New Project" in the Vercel dashboard
   - Import the project from GitHub or upload the project files
   - Configure the project settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Click "Deploy"

3. **Configure Environment Variables**:
   - In the Vercel dashboard, go to your project settings
   - Add the following environment variables:
     - `EMAIL_TO`: info@kmiservices.co.uk
     - `EMAIL_FROM`: noreply@kmiservices.co.uk

4. **Custom Domain Setup** (Optional):
   - In the Vercel dashboard, go to your project settings > Domains
   - Add your custom domain (e.g., quotes.kmiservices.co.uk)
   - Follow the instructions to verify domain ownership and configure DNS

### Option 2: Netlify Deployment

Netlify is another excellent platform for hosting web applications.

1. **Create a Netlify Account**:
   - Go to [netlify.com](https://netlify.com) and sign up for a free account

2. **Deploy the Application**:
   - Click "New site from Git" in the Netlify dashboard
   - Import the project from GitHub or upload the project files
   - Configure the build settings:
     - Build Command: `npm run build`
     - Publish Directory: `.next`
   - Click "Deploy site"

3. **Configure Environment Variables**:
   - In the Netlify dashboard, go to Site settings > Build & deploy > Environment
   - Add the same environment variables as listed in the Vercel instructions

4. **Custom Domain Setup** (Optional):
   - In the Netlify dashboard, go to Site settings > Domain management
   - Add your custom domain and follow the instructions

## Integration with GoDaddy Website

### Method 1: Direct Link

The simplest integration method is to add a link from your GoDaddy website to the deployed application.

1. **Create a Button or Link**:
   - Log in to your GoDaddy website builder
   - Add a prominent button or link labeled "Get a Quote"
   - Set the link URL to your deployed application URL
   - Save and publish your changes

2. **Styling Recommendations**:
   - Use a contrasting color for the button to make it stand out
   - Place the button in a prominent location (header, hero section, or sidebar)
   - Add a call-to-action text like "Get Your Cleaning Quote Now"

### Method 2: Iframe Embedding

For a more integrated experience, you can embed the application within your GoDaddy website.

1. **Create an Iframe**:
   - Log in to your GoDaddy website builder
   - Add an HTML element to the page where you want to embed the quote form
   - Insert the following HTML code:
   ```html
   <iframe 
     src="YOUR_DEPLOYED_APP_URL" 
     width="100%" 
     height="800px" 
     style="border: none; width: 100%;" 
     title="KMI Services Quote Form">
   </iframe>
   ```
   - Replace `YOUR_DEPLOYED_APP_URL` with your actual deployed application URL
   - Save and publish your changes

2. **Considerations**:
   - The iframe height may need adjustment based on your form's content
   - Some GoDaddy website plans may have limitations on custom HTML

## Data Management

The application includes a data management interface for updating pricing and services information:

1. **Accessing the Data Management Interface**:
   - Navigate to `YOUR_DEPLOYED_APP_URL/admin/data-management`
   - This interface allows you to update:
     - Service types
     - Property sizes
     - Optional extras and their costs
     - Markup percentage

2. **Making Updates**:
   - Changes made through this interface are saved to the application's database
   - Updates take effect immediately for all new quotes

## Security Considerations

1. **Admin Access Protection**:
   - Consider adding password protection to the admin area
   - Contact your developer to implement this if needed

2. **Regular Backups**:
   - Periodically export your pricing data as a backup
   - This can be done through the data management interface

## Troubleshooting

If you encounter any issues with the deployment or integration:

1. **Deployment Failures**:
   - Check the build logs in your hosting platform dashboard
   - Ensure all environment variables are correctly set

2. **Integration Issues**:
   - Verify that the URL in your link or iframe is correct
   - Check for any content security policies that might block iframes

3. **Data Management Issues**:
   - Clear your browser cache if changes aren't appearing
   - Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari)

## Support

For additional support or questions about the deployment process, please contact your developer or email info@kmiservices.co.uk.
