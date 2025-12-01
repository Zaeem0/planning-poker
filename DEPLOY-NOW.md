# 🚀 Deploy to Render in 5 Minutes

**Quick deployment guide** - Get your Planning Poker app live in minutes!

---

## Step 1: Push to GitHub (2 minutes)

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## Step 2: Create Render Account (1 minute)

1. Go to **[render.com](https://render.com)**
2. Click **"Get Started"**
3. Sign up with your **GitHub account**

---

## Step 3: Deploy (2 minutes)

1. In Render Dashboard, click **"New +"** → **"Web Service"**

2. Click **"Connect a repository"** → Find your `planning-poker` repo

3. Render will detect `render.yaml` automatically
   - Click **"Apply"** to use the configuration

4. Click **"Create Web Service"**

5. Wait 3-5 minutes for deployment ⏳

---

## Step 4: Test Your App (30 seconds)

Once deployment completes:

1. Click the URL shown in Render (e.g., `https://planning-poker-xxxx.onrender.com`)
2. Create a new game
3. Open the URL in another browser/tab
4. Join the same game
5. Test voting! 🎉

---

## ✅ You're Done!

Your Planning Poker app is now **live and ready to use**!

### Share with your team:
```
🃏 Planning Poker is live!
URL: https://your-app-name.onrender.com

Create a game and start estimating!
```

---

## 🔧 Optional: Custom Configuration

### Set Environment Variables (if needed)

In Render Dashboard:
1. Go to your service
2. Click **"Environment"** tab
3. Add variables:
   - `CORS_ORIGIN` - Restrict to your domain (for security)
   - `NEXT_PUBLIC_SOCKET_URL` - Usually auto-detected

---

## ⚠️ Free Tier Note

**Your app will spin down after 15 minutes of inactivity.**

- First request after spin down takes ~30 seconds
- Perfect for hobby projects and demos
- Upgrade to **Starter ($7/month)** for always-on

---

## 🐛 Troubleshooting

### Build Failed?
- Check Render logs for errors
- Ensure all dependencies are in `package.json`

### Can't Connect?
- Wait for deployment to complete (check status)
- Clear browser cache and try again

### WebSocket Issues?
- Check browser console for errors
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly

### Need More Help?
See detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎊 Success!

**Congratulations!** You've deployed your first real-time app to production.

### What's Next?

- [ ] Share the URL with your team
- [ ] Test with multiple users
- [ ] Consider upgrading to paid tier for production use
- [ ] Set up a custom domain (optional)

---

**Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

