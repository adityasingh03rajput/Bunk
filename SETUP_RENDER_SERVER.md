# Setup Guide: Connect Admin Panel to Render Server

## Problem
The admin panel shows hardcoded branches (Data Science, Computer Science, etc.) instead of fetching them dynamically from the server.

## Solution
Configure the admin panel to use the Render server URL.

---

## Method 1: Using Admin Panel UI (Recommended)

1. **Open Admin Panel**
   - Run: `admin-panel/Run-LetsBunk-Admin.bat`
   - Or double-click the executable

2. **Go to Settings**
   - Click on **⚙️ Settings** in the left sidebar

3. **Update Server URL**
   - Find the **"Server Configuration"** section
   - In the **"Server URL"** input field, replace the current value with:
     ```
     https://letsbunk-uw7g.onrender.com
     ```
   - Click the **"Save"** button

4. **Refresh the Page**
   - Press `Ctrl + R` or `F5` to reload
   - The admin panel will now fetch data from Render

---

## Method 2: Using Browser Console (Quick)

1. **Open Admin Panel**

2. **Open Browser Console**
   - Press `F12` or `Ctrl + Shift + I`
   - Go to the **Console** tab

3. **Run This Command**
   ```javascript
   localStorage.setItem('serverUrl', 'https://letsbunk-uw7g.onrender.com');
   location.reload();
   ```

4. **Page Will Reload**
   - Admin panel now connected to Render server

---

## Method 3: Using the Script File

1. **Open Admin Panel**

2. **Open Browser Console** (`F12`)

3. **Copy and paste the contents of `admin-panel/set-render-url.js`**

4. **Press Enter**

5. **Click OK** when prompted to reload

---

## Verify Connection

After setting the server URL:

1. Check the **bottom-left corner** of the admin panel
   - Should show: 🟢 **Connected** (green dot)

2. Go to **Settings** section
   - The **Branches**, **Semesters**, and **Departments** should load from the server
   - If empty, you can add them using the **➕ Add** buttons

3. Go to **Students** section
   - Should show students from the database

---

## About MongoDB URL

**Q: Does the enrollment app or admin panel need MongoDB URL?**

**A: NO!** 

- ✅ **Enrollment App** → Only uses REST API (`https://letsbunk-uw7g.onrender.com/api`)
- ✅ **Admin Panel** → Only uses REST API (`https://letsbunk-uw7g.onrender.com`)
- ✅ **Server (server.js)** → Uses MongoDB (already configured in `.env` file)

The apps never connect directly to MongoDB. They only talk to the Node.js server via HTTP requests.

---

## Troubleshooting

### Server shows "Disconnected"
- Check if the Render server is running
- Visit: https://letsbunk-uw7g.onrender.com/api/health
- Should return: `{"status":"ok"}`

### Branches still hardcoded
- Make sure you saved the server URL in Settings
- Refresh the page (`Ctrl + R`)
- Check browser console for errors (`F12`)

### Can't save server URL
- Make sure you clicked the **"Save"** button
- Check if localStorage is enabled in your browser

---

## Current Configuration

- **Server URL**: `https://letsbunk-uw7g.onrender.com`
- **Enrollment App API**: `https://letsbunk-uw7g.onrender.com/api`
- **MongoDB**: Connected via server (not directly accessible from apps)

---

## Next Steps

After connecting to Render:

1. **Add Branches** in Settings if needed
2. **Add Students** using the Students section
3. **Test Enrollment App** - search for students by enrollment number
4. **Create Timetables** for different branches

---

**Note**: The Render free tier may spin down after inactivity. First request might take 30-60 seconds to wake up the server.
