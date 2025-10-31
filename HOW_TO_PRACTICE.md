# 🎯 Simple Practice Guide for Vote App

## Step 1: Start the App (2 terminals needed)

### Terminal 1 - Start Backend:
```bash
cd /home/laine/app/vote-app/backend
npm start
```
**You should see:**
- "Server running on port 5000"  
- "MongoDB Connected"

### Terminal 2 - Start Frontend:
```bash
cd /home/laine/app/vote-app/frontend
npm start
```
**You should see:**
- Frontend opens at http://localhost:3000

---

## Step 2: Basic Testing (5 minutes)

### Test 1: User Registration
1. Go to http://localhost:3000
2. Fill in the registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Register"
4. ✅ Should show "Welcome testuser!" at the top

### Test 2: Create Your First Vote
1. Click "Create Vote" button
2. Fill in the form:
   - Title: `Best Programming Language`
   - Description: `Which language do you prefer?`
   - Options: `JavaScript`, `Python`, `Java`
   - Start Time: Leave as current time
   - End Time: Set to 1 hour from now
3. Click "Create Vote"
4. ✅ Should show your vote in the list

### Test 3: Vote on Your Poll
1. Click on your vote to open details
2. Click "Vote" button on one of the options
3. ✅ Should show results immediately with progress bars

---

## Step 3: Multi-User Testing (10 minutes)

### Open Second Browser Window (Incognito)
1. Open incognito/private window
2. Go to http://localhost:3000
3. Register second user:
   - Username: `alice`
   - Email: `alice@example.com`
   - Password: `password123`

### Test Real-Time Updates
1. **Window 1 (testuser)**: Create a new vote
2. **Window 2 (alice)**: Refresh page, vote should appear
3. **Window 2 (alice)**: Vote on the poll
4. **Window 1 (testuser)**: Watch results update in real-time!

---

## Step 4: Test Comments (5 minutes)

1. Go to any vote detail page
2. Add comment: `This is a great poll!`
3. ✅ Comment should appear with your username
4. Try editing/deleting your comment
5. Switch users and add more comments

---

## Step 5: Test Rankings (5 minutes)

1. Create several votes
2. Vote on them and view them multiple times
3. Check homepage for "오늘의 베스트 투표 TOP 3"
4. ✅ Most popular votes should appear at top

---

## Common Issues & Solutions

### ❌ "Can't connect to backend"
**Fix:** Make sure backend is running on port 5000
```bash
curl http://localhost:5000/api/votes
# Should return JSON data
```

### ❌ "MongoDB connection failed"
**Fix:** Start MongoDB
```bash
sudo systemctl start mongod
```

### ❌ "JWT token errors"
**Fix:** Already fixed - JWT_SECRET is now in .env file

### ❌ "Can't vote twice"
**This is correct behavior!** One vote per user per poll

---

## Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend opens at localhost:3000
- [ ] Can register new user
- [ ] Can login/logout
- [ ] Can create vote
- [ ] Can vote on poll
- [ ] Results update in real-time
- [ ] Can add comments
- [ ] Best votes ranking works

---

## Advanced Practice Ideas

Once basics work, try:
- **Scheduling**: Create votes that start tomorrow
- **Anonymous voting**: Toggle anonymous option
- **Error testing**: Stop backend, try to vote
- **Performance**: Create 10+ votes, test speed
- **Mobile**: Test on phone browser

---

## 🎯 Success = All Checkboxes ✅

When you can check all boxes above, you've successfully practiced all major features!

**Next Steps:** 
- Try building similar features
- Add new functionality
- Deploy to production
- Show friends and get feedback