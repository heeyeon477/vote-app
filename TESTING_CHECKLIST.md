# ✅ Vote App Testing Checklist

Use this checklist to systematically test all features of the Vote App.

## 🚀 Pre-Testing Setup

- [ ] MongoDB is running
- [ ] Backend server started (`cd backend && npm start`)
- [ ] Frontend server started (`cd frontend && npm start`)
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/api/votes (shows JSON)

## 👤 User Authentication

### Registration
- [ ] Register new user with valid data
- [ ] Try to register with existing email (should fail)
- [ ] Try to register with invalid email format (should fail)
- [ ] Try to register with short password (should fail)

### Login/Logout
- [ ] Login with valid credentials
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Logout successfully
- [ ] UI updates correctly after login/logout

## 🗳️ Vote Creation

### Basic Vote Creation
- [ ] Create vote with 2 options (minimum)
- [ ] Create vote with 5+ options
- [ ] Create vote with description
- [ ] Create vote without description
- [ ] Create anonymous vote
- [ ] Create public vote

### Scheduling
- [ ] Create vote starting now
- [ ] Create vote starting in future
- [ ] Create vote ending in 1 hour
- [ ] Create vote ending in 1 week
- [ ] Try invalid time range (end before start) - should fail

### Validation
- [ ] Try creating vote with 1 option (should fail)
- [ ] Try creating vote without title (should fail)
- [ ] Try creating vote without login (should fail)

## 🎯 Voting Process

### Single User Voting
- [ ] Vote on active poll
- [ ] Try to vote twice on same poll (should fail)
- [ ] Try to vote on upcoming poll (should fail)
- [ ] Try to vote on ended poll (should fail)
- [ ] Vote without login (should fail)

### Multi-User Voting
- [ ] Open 2 browsers with different users
- [ ] Both users vote on same poll
- [ ] Results update in real-time
- [ ] Vote counts are accurate
- [ ] Percentages calculate correctly

## 💬 Comment System

### Basic Comments
- [ ] Add comment to vote (logged in)
- [ ] Try to comment without login (should show message)
- [ ] View comments from other users
- [ ] Comments show correct timestamps
- [ ] Comments show correct usernames

### Comment Management
- [ ] Edit your own comment
- [ ] Delete your own comment
- [ ] Try to edit someone else's comment (should fail)
- [ ] Try to delete someone else's comment (should fail)
- [ ] Test 500-character limit

## 🏆 Best Votes Ranking

### Ranking Logic
- [ ] Create vote and view it multiple times
- [ ] Get multiple people to vote on it
- [ ] Check if it appears in "Best Votes" section
- [ ] Verify ranking order makes sense
- [ ] Check popularity score calculation

### Display
- [ ] Rankings show on homepage
- [ ] Click on ranked vote goes to detail page
- [ ] Rankings update as engagement changes
- [ ] Shows view count and vote count correctly

## 📊 Real-Time Features

### Auto-Updates
- [ ] Vote results update every 30 seconds
- [ ] New votes appear in list automatically
- [ ] Status changes (upcoming → active → ended) work
- [ ] Real-time indicator shows for active votes

### Data Consistency
- [ ] Refresh page preserves login state
- [ ] Vote results consistent across multiple browsers
- [ ] Comments appear for all users
- [ ] Rankings stay consistent

## 🔍 Error Handling

### Network Issues
- [ ] Stop backend server, try to vote (shows error)
- [ ] Stop backend server, try to login (shows error)
- [ ] Restart server, functionality restored

### User Experience
- [ ] Error messages are user-friendly
- [ ] Loading states show while processing
- [ ] Form validation provides clear feedback
- [ ] Success messages confirm actions

## 📱 User Interface

### Layout & Design
- [ ] Homepage displays all sections properly
- [ ] Vote cards show all necessary information
- [ ] Vote detail page is well-organized
- [ ] Progress bars animate smoothly
- [ ] Colors and badges indicate status clearly

### Navigation
- [ ] Can navigate between home and vote details
- [ ] Browser back button works correctly
- [ ] URL changes appropriately
- [ ] Page titles are descriptive

## 🎮 Advanced Scenarios

### Edge Cases
- [ ] Vote with very long title/description
- [ ] Vote with maximum number of options
- [ ] Vote ending in 1 minute (test status transition)
- [ ] Multiple tabs open, consistent behavior

### Performance
- [ ] App works with 10+ votes
- [ ] Vote detail loads quickly
- [ ] Comments section handles many comments
- [ ] Real-time updates don't cause lag

### Data Validation
- [ ] Invalid date formats handled
- [ ] Special characters in vote content work
- [ ] Long usernames display correctly
- [ ] Empty responses handled gracefully

## 🏆 Completion Goals

### Basic Functionality (Must Pass)
- [ ] All authentication features work
- [ ] Can create and vote on polls
- [ ] Real-time updates function
- [ ] Comment system operational
- [ ] Error handling is adequate

### Advanced Features (Nice to Have)
- [ ] Best votes ranking accurate
- [ ] UI is polished and responsive
- [ ] Performance is smooth
- [ ] Edge cases handled well
- [ ] User experience is intuitive

## 📝 Notes Section

Use this space to record issues found, ideas for improvements, or testing observations:

```
Date: ___________

Issues Found:
- 
- 
- 

Improvements Needed:
- 
- 
- 

Working Well:
- 
- 
- 
```

---

## 🎯 Quick Test Commands

```bash
# Start everything
./start.sh

# Create sample data
./create-sample-data.sh

# Check backend API
curl http://localhost:5000/api/votes

# Check MongoDB data
mongosh vote-app --eval "db.votes.find().pretty()"
```

---

**✅ Testing Complete When:**
- All basic functionality checkboxes are checked
- App works reliably for multiple users
- Error cases are handled appropriately  
- User experience feels smooth and intuitive