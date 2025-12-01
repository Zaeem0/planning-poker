# 🚀 Deployment Guide

This guide will help you deploy Planning Poker to Render.com for free.

## 📋 Prerequisites

- A GitHub account
- Your code pushed to a GitHub repository
- A Render.com account (free to create)

## 💻 Local Development Note

The repository includes a `.env.local` file configured for local development:

- Server runs on `localhost:3000`
- No additional configuration needed
- Just run `npm run dev` and you're ready!

**Note:** `.env.local` is git-ignored and won't be deployed to production.

## 🎯 Quick Deploy to Render

### Option 1: Using render.yaml (Recommended)

This is the easiest method as the configuration is already set up in `render.yaml`.

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Sign up/Login to Render**

   - Go to [render.com](https://render.com)
   - Sign up or log in with your GitHub account

3. **Create New Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to use the configuration

4. **Deploy!**
   - Render will automatically build and deploy your app
   - Wait 3-5 minutes for the first deployment
   - Your app will be live at `https://your-app-name.onrender.com`

### Option 2: Manual Configuration

If you prefer to configure manually:

1. **Create New Web Service**

   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**

   - **Name**: `planning-poker` (or your preferred name)
   - **Runtime**: `Node`
   - **Build Command**: `yarn install --frozen-lockfile && yarn build`
   - **Start Command**: `yarn start`
   - **Plan**: `Free`

3. **Set Environment Variables**

   - Click "Advanced" → "Add Environment Variable"
   - Add the following:
     ```
     NODE_ENV=production
     HOSTNAME=0.0.0.0
     CORS_ORIGIN=*
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

## 🔧 Post-Deployment Configuration

### Optional: Set Custom Socket URL

By default, the app will use the same URL for both the frontend and WebSocket connections. If you need to customize this:

1. Go to your Render service dashboard
2. Navigate to "Environment" tab
3. Add environment variable:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-app-name.onrender.com
   ```
4. Save and redeploy

## ⚡ Important Notes

### Free Tier Limitations

- **Spin Down**: Free tier services spin down after 15 minutes of inactivity
- **Cold Start**: First request after spin down takes ~30 seconds
- **Uptime**: 750 hours/month (enough for 24/7 operation)

### Upgrading to Paid Tier

For production use without cold starts:

1. Go to your service settings
2. Change plan from "Free" to "Starter" ($7/month)
3. Your app will stay always-on with no spin down

## 🔍 Troubleshooting

### Build Fails

**Issue**: Build command fails
**Solution**: Check that all dependencies are in `package.json`, not just `devDependencies`

### WebSocket Connection Fails

**Issue**: Socket.IO not connecting
**Solution**:

1. Check that `NEXT_PUBLIC_SOCKET_URL` is set correctly
2. Ensure CORS_ORIGIN allows your domain
3. Check Render logs for errors

### App Shows 404

**Issue**: Routes not working
**Solution**:

1. Ensure build completed successfully
2. Check that `npm start` command is correct
3. Review Render logs for startup errors

## 📊 Monitoring

### View Logs

1. Go to your Render service dashboard
2. Click "Logs" tab
3. View real-time logs of your application

### Check Metrics

1. Go to "Metrics" tab
2. Monitor CPU, Memory, and Request metrics

## 🔄 Auto-Deploy

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will detect the push and redeploy automatically.

## 🌐 Custom Domain (Optional)

To use your own domain:

1. Go to service "Settings"
2. Scroll to "Custom Domain"
3. Click "Add Custom Domain"
4. Follow DNS configuration instructions

## 📞 Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **Project Issues**: Create an issue in your GitHub repository

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created and connected to repo
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] App accessible at Render URL
- [ ] WebSocket connections working
- [ ] Game creation and joining tested

---

**🎉 Congratulations!** Your Planning Poker app is now live and ready to use!
