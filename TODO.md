# Quiz Real-time Integration Tasks

## Current Status Analysis
- Client Quiz.jsx uses localStorage and static quizBank
- Server has real-time routes and dynamic question generation
- QuizHome.jsx already fetches server progress
- Languages mismatch between client constants.js (html/css) and server (cpp/java)

## Tasks to Complete

### 1. Align Languages Between Client and Server
- Update client/src/data/constants.js to match server languages (javascript, python, cpp, java)
- Remove html/css from client constants

### 2. Modify Quiz.jsx to Fetch Progress from Server
- Replace localStorage usage with server API calls
- Use loadUserProgress() on component mount
- Update userProgress state with server data

### 3. Update Quiz.jsx to Fetch Questions from Server
- Replace static QUIZ_BANK usage with server API
- Modify loadLevel() to call /api/quiz/:language/:level
- Handle server response format

### 4. Implement Submit Answer to Server
- Update submit logic to use /api/quiz/submit endpoint
- Handle server response and update local state
- Remove localStorage updates

### 5. Update Level Selection UI
- Use server progress for level unlocking logic
- Update disabled state based on server data
- Ensure real-time reflection of unlocked levels

### 6. Test Quiz Flow
- Test level 1 completion unlocks level 2
- Verify persistent progress across sessions
- Test with real-time data

### 7. Verify Server Question Generation
- Ensure levels 3-99 have questions via dynamic generation
- Test fallback mechanism

## Implementation Order
1. Align languages
2. Update Quiz.jsx progress fetching
3. Update question fetching
4. Update answer submission
5. Update level selection UI
6. Test and verify
