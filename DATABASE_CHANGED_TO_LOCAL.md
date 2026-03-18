# 🗄️ Database Changed to Local MongoDB

## Date: March 8, 2026

---

## ✅ Changes Made

Database connection has been changed from MongoDB Atlas (cloud) to local MongoDB.

### Configuration Updated

#### 1. **Created .env file**
```env
# MongoDB Local Connection
MONGODB_URI=mongodb://localhost:27017/attendance_app

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### 2. **Updated .env.example**
```env
# MongoDB Local Connection (Default)
MONGODB_URI=mongodb://localhost:27017/attendance_app

# MongoDB Atlas Connection (Production - Optional)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_app
```

---

## 📊 Local Database Status

### Database: `attendance_app`
- **Size**: 3.50 MiB
- **Location**: `localhost:27017`

### Collections (18 total):
```
✅ studentmanagements    - 123 students
✅ teachers              - 10 teachers
✅ classrooms            - 1 classroom
✅ timetables            - 13 timetables
✅ periodattendances     - 0 records (ready for new data)
✅ dailyattendances      - Daily attendance summaries
✅ attendancesessions    - Active sessions
✅ attendancerecords     - Historical records
✅ attendanceaudits      - Audit trail
✅ randomrings           - Random verification
✅ systemsettings        - System configuration
✅ subjects              - Subject definitions
✅ branches              - Branch configurations
✅ branchconfigs         - Branch settings
✅ configs               - App configurations
✅ holidays              - Holiday calendar
✅ students              - Legacy student data
✅ attendancehistories   - Historical data
```

---

## 🚀 Quick Start

### 1. Verify MongoDB is Running
```bash
# Check MongoDB service
mongosh --eval "db.version()"

# Should show MongoDB version (e.g., 7.0.0)
```

### 2. Verify Database Connection
```bash
# Connect to database
mongosh attendance_app

# List collections
show collections

# Count students
db.studentmanagements.countDocuments()
# Should show: 123
```

### 3. Start the Server
```bash
cd LetsBunk
npm start
```

Server will connect to: `mongodb://localhost:27017/attendance_app`

---

## 🔍 Database Verification

### Check Data Integrity

```bash
# Run verification script
mongosh attendance_app --eval "
  print('=== Database Verification ===');
  print('Students: ' + db.studentmanagements.countDocuments());
  print('Teachers: ' + db.teachers.countDocuments());
  print('Classrooms: ' + db.classrooms.countDocuments());
  print('Timetables: ' + db.timetables.countDocuments());
  print('Subjects: ' + db.subjects.countDocuments());
  print('System Settings: ' + db.systemsettings.countDocuments());
"
```

### Sample Student Data

```bash
# View first student
mongosh attendance_app --eval "db.studentmanagements.findOne()"
```

### Sample Teacher Data

```bash
# View first teacher
mongosh attendance_app --eval "db.teachers.findOne()"
```

---

## 📝 Environment Variables

### Current Configuration (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/attendance_app

# Server
PORT=3000
NODE_ENV=development

# Redis (Optional - Local)
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary (Optional - for images)
CLOUDINARY_CLOUD_NAME=cloudinary
CLOUDINARY_API_KEY=445132764832368
CLOUDINARY_API_SECRET=0OXqzNMmfifBAjqUUIIQft8P3l0

# Security
JWT_SECRET=your-secret-key-here-change-in-production
SESSION_SECRET=your-session-secret-here-change-in-production

# CORS
ALLOWED_ORIGINS=*
```

---

## 🔧 MongoDB Setup (If Not Installed)

### Windows Installation

1. **Download MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Download Windows MSI installer

2. **Install MongoDB**
   ```
   - Run installer
   - Choose "Complete" installation
   - Install as Windows Service
   - Install MongoDB Compass (GUI tool)
   ```

3. **Verify Installation**
   ```bash
   mongosh --version
   ```

4. **Start MongoDB Service**
   ```bash
   net start MongoDB
   ```

### Create Database (If Starting Fresh)

```bash
# Connect to MongoDB
mongosh

# Create database
use attendance_app

# Create first collection
db.systemsettings.insertOne({
  settingKey: "attendance_threshold",
  value: "75",
  description: "Minimum attendance percentage required"
})

# Verify
show collections
```

---

## 🔄 Data Migration (If Needed)

### From MongoDB Atlas to Local

If you need to migrate data from Atlas to local:

1. **Export from Atlas**
   ```bash
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/attendance_app" --out=./backup
   ```

2. **Import to Local**
   ```bash
   mongorestore --db=attendance_app ./backup/attendance_app
   ```

### From Local to Atlas

If you need to push local data to Atlas:

1. **Export from Local**
   ```bash
   mongodump --db=attendance_app --out=./backup
   ```

2. **Import to Atlas**
   ```bash
   mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net" ./backup
   ```

---

## 🛠️ Troubleshooting

### Issue: "MongoServerError: connect ECONNREFUSED"

**Cause**: MongoDB service is not running

**Solution**:
```bash
# Windows
net start MongoDB

# Or check service status
sc query MongoDB
```

### Issue: "Database not found"

**Cause**: Database doesn't exist yet

**Solution**:
```bash
# Database will be created automatically when server starts
# Or create manually:
mongosh
use attendance_app
db.systemsettings.insertOne({settingKey: "init", value: "true"})
```

### Issue: "Authentication failed"

**Cause**: MongoDB has authentication enabled

**Solution**:
```env
# Update .env with credentials
MONGODB_URI=mongodb://username:password@localhost:27017/attendance_app
```

### Issue: "Cannot find module 'mongoose'"

**Cause**: Dependencies not installed

**Solution**:
```bash
cd LetsBunk
npm install
```

---

## 📊 Database Backup

### Manual Backup

```bash
# Create backup
mongodump --db=attendance_app --out=./backups/backup-$(date +%Y%m%d)

# Restore backup
mongorestore --db=attendance_app ./backups/backup-20260308/attendance_app
```

### Automated Backup Script

```bash
# Run backup script
cd LetsBunk
node scripts/backup-database.js
```

Backups are saved to: `LetsBunk/backups/`

---

## 🔐 Security Recommendations

### For Development (Current Setup)
- ✅ No authentication (localhost only)
- ✅ Default port 27017
- ✅ Local access only

### For Production (Recommended)

1. **Enable Authentication**
   ```bash
   # Create admin user
   mongosh
   use admin
   db.createUser({
     user: "letsbunk_admin",
     pwd: "secure_password_here",
     roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
   })
   ```

2. **Update .env**
   ```env
   MONGODB_URI=mongodb://letsbunk_admin:secure_password@localhost:27017/attendance_app?authSource=admin
   ```

3. **Enable Access Control**
   - Edit `mongod.cfg`
   - Add: `security.authorization: enabled`
   - Restart MongoDB service

---

## 📈 Performance Optimization

### Create Indexes

```javascript
// Run in mongosh
use attendance_app

// Student indexes
db.studentmanagements.createIndex({ enrollmentNo: 1 }, { unique: true })
db.studentmanagements.createIndex({ semester: 1, branch: 1 })

// Attendance indexes
db.periodattendances.createIndex({ enrollmentNo: 1, date: -1 })
db.periodattendances.createIndex({ date: -1, period: 1 })

// Teacher indexes
db.teachers.createIndex({ teacherId: 1 }, { unique: true })

// Timetable indexes
db.timetables.createIndex({ semester: 1, branch: 1 })
```

### Monitor Performance

```bash
# Check database stats
mongosh attendance_app --eval "db.stats()"

# Check collection stats
mongosh attendance_app --eval "db.studentmanagements.stats()"
```

---

## 🌐 Network Configuration

### Current Setup (Local Only)

```
┌─────────────────────────────────────────┐
│  Computer (localhost)                   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  MongoDB Server                   │ │
│  │  ├─ Port: 27017                   │ │
│  │  ├─ Database: attendance_app      │ │
│  │  └─ Size: 3.50 MiB                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Node.js Server                   │ │
│  │  ├─ Port: 3000                    │ │
│  │  └─ Connects to: localhost:27017 │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

- [x] MongoDB installed and running
- [x] Local database `attendance_app` exists
- [x] Database has 123 students
- [x] Database has 10 teachers
- [x] Database has 13 timetables
- [x] .env file created with local MongoDB URI
- [x] .env.example updated with local configuration
- [ ] Server tested and connects successfully
- [ ] Admin panel tested with local database
- [ ] Mobile app tested with local database

---

## 🔄 Switch Back to Atlas (If Needed)

To switch back to MongoDB Atlas:

1. **Update .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_app?retryWrites=true&w=majority
   ```

2. **Restart Server**
   ```bash
   npm start
   ```

3. **Verify Connection**
   - Check server logs for "Connected to MongoDB"
   - Test API endpoints

---

## 📞 Support

### Check MongoDB Status
```bash
# Windows
sc query MongoDB

# Check if port is listening
netstat -ano | findstr :27017
```

### View MongoDB Logs
```bash
# Default log location (Windows)
C:\Program Files\MongoDB\Server\7.0\log\mongod.log
```

### Test Connection
```bash
# Simple connection test
mongosh --eval "db.version()"

# Full connection test
mongosh attendance_app --eval "db.getCollectionNames()"
```

---

## 📚 Additional Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/
- MongoDB Compass (GUI): https://www.mongodb.com/products/compass

---

**Status**: ✅ Database changed to local MongoDB

**Database**: `attendance_app` (3.50 MiB, 18 collections)

**Connection**: `mongodb://localhost:27017/attendance_app`

**Ready for**: Local development and testing
