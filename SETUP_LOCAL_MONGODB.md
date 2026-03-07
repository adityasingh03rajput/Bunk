# 🗄️ Local MongoDB Setup Guide

## Prerequisites

You need to install MongoDB Community Edition on your Windows machine.

## Installation Steps

### Option 1: MongoDB Community Server (Recommended)

1. **Download MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Version: Latest (7.0 or higher)
   - Package: MSI

2. **Install MongoDB**
   ```
   - Run the downloaded .msi installer
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)
   ```

3. **Verify Installation**
   ```cmd
   # Open Command Prompt and run:
   mongod --version
   
   # Should show MongoDB version
   ```

4. **Start MongoDB Service**
   ```cmd
   # MongoDB should auto-start as a Windows Service
   # To manually start:
   net start MongoDB
   
   # To check status:
   sc query MongoDB
   ```

### Option 2: MongoDB via Chocolatey (Quick Install)

```powershell
# Install Chocolatey first (if not installed):
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install MongoDB:
choco install mongodb

# Start MongoDB:
net start MongoDB
```

## Configuration

### 1. MongoDB Data Directory

MongoDB stores data in: `C:\Program Files\MongoDB\Server\7.0\data\`

To use a custom directory:
```cmd
mongod --dbpath "D:\mongodb-data"
```

### 2. MongoDB Configuration File

Default location: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

```yaml
# Example configuration
storage:
  dbPath: C:\Program Files\MongoDB\Server\7.0\data
systemLog:
  destination: file
  path: C:\Program Files\MongoDB\Server\7.0\log\mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
```

## Verify Connection

### Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connection String: `mongodb://localhost:27017`
3. Click "Connect"
4. You should see the `attendance_app` database after running the server

### Using Command Line

```cmd
# Connect to MongoDB shell
mongosh

# Or using legacy mongo shell
mongo

# List databases
show dbs

# Use attendance_app database
use attendance_app

# Show collections
show collections

# Query students
db.students.find()
```

## Start LetsBunk Server

```cmd
# Navigate to project directory
cd LetsBunk

# Install dependencies (if not done)
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

## Troubleshooting

### MongoDB Service Not Starting

```cmd
# Check if port 27017 is in use
netstat -ano | findstr :27017

# Stop MongoDB service
net stop MongoDB

# Start MongoDB service
net start MongoDB

# Restart MongoDB service
net stop MongoDB && net start MongoDB
```

### Connection Refused Error

1. Ensure MongoDB service is running:
   ```cmd
   sc query MongoDB
   ```

2. Check if MongoDB is listening on port 27017:
   ```cmd
   netstat -ano | findstr :27017
   ```

3. Verify firewall settings allow localhost connections

### Database Not Created

MongoDB creates databases automatically when you first write data to them. The `attendance_app` database will be created when you:
- Add your first student
- Add your first teacher
- Create a timetable

### Permission Issues

Run Command Prompt or PowerShell as Administrator when:
- Starting/stopping MongoDB service
- Modifying MongoDB configuration
- Changing data directory

## MongoDB Compass (GUI Tool)

MongoDB Compass provides a visual interface to:
- Browse databases and collections
- View and edit documents
- Run queries
- Analyze performance
- Import/export data

**Connection String for Compass:**
```
mongodb://localhost:27017
```

## Useful MongoDB Commands

```javascript
// Switch to attendance_app database
use attendance_app

// Count students
db.students.countDocuments()

// Find all students
db.students.find().pretty()

// Find student by enrollment number
db.students.findOne({ enrollmentNo: "CS2024001" })

// Count attendance records
db.attendancerecords.countDocuments()

// Find today's attendance
db.attendancerecords.find({ 
  date: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
})

// Drop database (CAUTION: Deletes all data)
db.dropDatabase()

// Create index for better performance
db.students.createIndex({ enrollmentNo: 1 })
db.attendancerecords.createIndex({ date: -1 })
```

## Backup and Restore

### Backup Database

```cmd
# Backup entire database
mongodump --db attendance_app --out "D:\backups\mongodb"

# Backup specific collection
mongodump --db attendance_app --collection students --out "D:\backups\mongodb"
```

### Restore Database

```cmd
# Restore entire database
mongorestore --db attendance_app "D:\backups\mongodb\attendance_app"

# Restore specific collection
mongorestore --db attendance_app --collection students "D:\backups\mongodb\attendance_app\students.bson"
```

## Performance Tips

1. **Indexes**: The server automatically creates indexes on startup
2. **Connection Pooling**: Configured in server.js (max 10 connections)
3. **Query Optimization**: Use indexes for frequently queried fields

## Security (Production)

For production deployment, enable authentication:

```javascript
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

// Create app user
use attendance_app
db.createUser({
  user: "letsbunk_user",
  pwd: "secure_password",
  roles: [ { role: "readWrite", db: "attendance_app" } ]
})

// Update .env with authentication
MONGODB_URI=mongodb://letsbunk_user:secure_password@localhost:27017/attendance_app
```

## Next Steps

1. ✅ Install MongoDB
2. ✅ Start MongoDB service
3. ✅ Update `.env` file with local connection string
4. ✅ Start LetsBunk server: `npm start`
5. ✅ Open Admin Panel and add students/teachers
6. ✅ Test the mobile app

---

**Need Help?**
- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Community Forums: https://www.mongodb.com/community/forums/
- LetsBunk Issues: Check the project README
