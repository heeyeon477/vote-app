from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Vote App API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/voteApp")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 43200))

client = MongoClient(MONGO_URI)
db = client.voteApp

# Collections
users_collection = db.users
votes_collection = db.votes
comments_collection = db.comments

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VoteOption(BaseModel):
    text: str
    votes: List[str] = []

class VoteCreate(BaseModel):
    title: str
    description: Optional[str] = None
    options: List[str]
    isAnonymous: bool = False
    startTime: datetime
    endTime: datetime

class VoteSubmission(BaseModel):
    optionIndex: int

class CommentCreate(BaseModel):
    content: str

class CommentUpdate(BaseModel):
    content: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

def get_vote_status(vote):
    now = datetime.utcnow()
    start_time = vote.get("startTime")
    end_time = vote.get("endTime")
    
    if now < start_time:
        return "upcoming"
    elif now > end_time:
        return "ended"
    else:
        return "active"

def serialize_object_id(obj):
    if isinstance(obj, dict):
        return {k: serialize_object_id(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_object_id(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

# Auth routes
@app.post("/api/auth/register")
async def register(user: UserCreate):
    # Check if user exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "createdAt": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    user_id = str(result.inserted_id)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "token": access_token,
        "_id": user_id,
        "username": user.username,
        "email": user.email
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):
    # Find user
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"sub": str(db_user["_id"])})
    
    return {
        "token": access_token,
        "_id": str(db_user["_id"]),
        "username": db_user["username"],
        "email": db_user["email"]
    }

# Vote routes
@app.get("/api/votes")
async def get_votes():
    votes = list(votes_collection.find().sort("createdAt", -1))
    
    for vote in votes:
        vote["status"] = get_vote_status(vote)
        # Calculate total votes
        total_votes = sum(len(option.get("votes", [])) for option in vote.get("options", []))
        vote["totalVotes"] = total_votes
        
        # Get creator info
        if vote.get("createdBy"):
            creator = users_collection.find_one({"_id": ObjectId(vote["createdBy"])})
            if creator:
                vote["createdBy"] = {"_id": str(creator["_id"]), "username": creator["username"]}
    
    return serialize_object_id(votes)

@app.post("/api/votes")
async def create_vote(vote: VoteCreate, current_user: dict = Depends(get_current_user)):
    if len(vote.options) < 2:
        raise HTTPException(status_code=400, detail="At least 2 options are required")
    
    if vote.startTime >= vote.endTime:
        raise HTTPException(status_code=400, detail="End time must be after start time")
    
    # Create vote document
    vote_data = {
        "title": vote.title,
        "description": vote.description,
        "options": [{"text": option, "votes": []} for option in vote.options],
        "isAnonymous": vote.isAnonymous,
        "startTime": vote.startTime,
        "endTime": vote.endTime,
        "createdBy": ObjectId(current_user["_id"]),
        "viewCount": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = votes_collection.insert_one(vote_data)
    
    # Return created vote with creator info
    created_vote = votes_collection.find_one({"_id": result.inserted_id})
    created_vote["status"] = get_vote_status(created_vote)
    created_vote["createdBy"] = {"_id": str(current_user["_id"]), "username": current_user["username"]}
    
    return serialize_object_id(created_vote)

@app.get("/api/votes/{vote_id}")
async def get_vote(vote_id: str):
    try:
        # Increment view count
        vote = votes_collection.find_one_and_update(
            {"_id": ObjectId(vote_id)},
            {"$inc": {"viewCount": 1}},
            return_document=True
        )
        
        if not vote:
            raise HTTPException(status_code=404, detail="Vote not found")
        
        vote["status"] = get_vote_status(vote)
        
        # Get creator info
        if vote.get("createdBy"):
            creator = users_collection.find_one({"_id": ObjectId(vote["createdBy"])})
            if creator:
                vote["createdBy"] = {"_id": str(creator["_id"]), "username": creator["username"]}
        
        # Populate vote options with user info if not anonymous
        if not vote.get("isAnonymous"):
            for option in vote.get("options", []):
                user_votes = []
                for user_id in option.get("votes", []):
                    user = users_collection.find_one({"_id": ObjectId(user_id)})
                    if user:
                        user_votes.append({"_id": str(user["_id"]), "username": user["username"]})
                option["votes"] = user_votes
        
        return serialize_object_id(vote)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid vote ID")

@app.post("/api/votes/{vote_id}/vote")
async def submit_vote(vote_id: str, submission: VoteSubmission, current_user: dict = Depends(get_current_user)):
    try:
        vote = votes_collection.find_one({"_id": ObjectId(vote_id)})
        if not vote:
            raise HTTPException(status_code=404, detail="Vote not found")
        
        # Check if vote is active
        if get_vote_status(vote) != "active":
            raise HTTPException(status_code=400, detail="This vote is not currently active")
        
        # Check if option index is valid
        if submission.optionIndex < 0 or submission.optionIndex >= len(vote["options"]):
            raise HTTPException(status_code=400, detail="Invalid option")
        
        # Check if user has already voted
        user_id = str(current_user["_id"])
        for option in vote["options"]:
            if user_id in [str(vote_id) for vote_id in option.get("votes", [])]:
                raise HTTPException(status_code=400, detail="You have already voted")
        
        # Add user's vote
        votes_collection.update_one(
            {"_id": ObjectId(vote_id)},
            {"$push": {f"options.{submission.optionIndex}.votes": ObjectId(user_id)}}
        )
        
        # Return updated vote
        updated_vote = votes_collection.find_one({"_id": ObjectId(vote_id)})
        updated_vote["status"] = get_vote_status(updated_vote)
        
        # Get creator info
        if updated_vote.get("createdBy"):
            creator = users_collection.find_one({"_id": ObjectId(updated_vote["createdBy"])})
            if creator:
                updated_vote["createdBy"] = {"_id": str(creator["_id"]), "username": creator["username"]}
        
        return serialize_object_id(updated_vote)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail="Invalid vote ID")

@app.get("/api/votes/best/today")
async def get_best_votes_today():
    # Get votes from today
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    votes = list(votes_collection.find({
        "createdAt": {"$gte": start_of_day}
    }).sort("createdAt", -1))
    
    # Calculate popularity scores
    votes_with_score = []
    for vote in votes:
        vote["status"] = get_vote_status(vote)
        
        # Calculate total participation
        total_votes = sum(len(option.get("votes", [])) for option in vote.get("options", []))
        
        # Popularity score: views * 1 + votes * 3
        popularity_score = vote.get("viewCount", 0) + (total_votes * 3)
        vote["popularityScore"] = popularity_score
        vote["totalVotes"] = total_votes
        
        # Get creator info
        if vote.get("createdBy"):
            creator = users_collection.find_one({"_id": ObjectId(vote["createdBy"])})
            if creator:
                vote["createdBy"] = {"_id": str(creator["_id"]), "username": creator["username"]}
        
        votes_with_score.append(vote)
    
    # Sort by popularity score and return top 3
    best_votes = sorted(votes_with_score, key=lambda x: x["popularityScore"], reverse=True)[:3]
    
    return serialize_object_id(best_votes)

# Comment routes
@app.get("/api/comments/vote/{vote_id}")
async def get_comments(vote_id: str):
    try:
        # Check if vote exists
        vote = votes_collection.find_one({"_id": ObjectId(vote_id)})
        if not vote:
            raise HTTPException(status_code=404, detail="Vote not found")
        
        # Get comments for this vote
        comments = list(comments_collection.find({"vote": ObjectId(vote_id)}).sort("createdAt", -1))
        
        # Populate author info
        for comment in comments:
            if comment.get("author"):
                author = users_collection.find_one({"_id": ObjectId(comment["author"])})
                if author:
                    comment["author"] = {"_id": str(author["_id"]), "username": author["username"]}
        
        return serialize_object_id(comments)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid vote ID")

@app.post("/api/comments/vote/{vote_id}")
async def create_comment(vote_id: str, comment: CommentCreate, current_user: dict = Depends(get_current_user)):
    try:
        if not comment.content or not comment.content.strip():
            raise HTTPException(status_code=400, detail="Comment content is required")
        
        if len(comment.content) > 500:
            raise HTTPException(status_code=400, detail="Comment must be 500 characters or less")
        
        # Check if vote exists
        vote = votes_collection.find_one({"_id": ObjectId(vote_id)})
        if not vote:
            raise HTTPException(status_code=404, detail="Vote not found")
        
        # Create comment
        comment_data = {
            "content": comment.content.strip(),
            "vote": ObjectId(vote_id),
            "author": ObjectId(current_user["_id"]),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = comments_collection.insert_one(comment_data)
        
        # Return created comment with author info
        created_comment = comments_collection.find_one({"_id": result.inserted_id})
        created_comment["author"] = {"_id": str(current_user["_id"]), "username": current_user["username"]}
        
        return serialize_object_id(created_comment)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail="Invalid vote ID")

@app.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: str, current_user: dict = Depends(get_current_user)):
    try:
        comment = comments_collection.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # Check if user is the author
        if str(comment["author"]) != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="You can only delete your own comments")
        
        comments_collection.delete_one({"_id": ObjectId(comment_id)})
        return {"message": "Comment deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail="Invalid comment ID")

@app.put("/api/comments/{comment_id}")
async def update_comment(comment_id: str, comment_update: CommentUpdate, current_user: dict = Depends(get_current_user)):
    try:
        if not comment_update.content or not comment_update.content.strip():
            raise HTTPException(status_code=400, detail="Comment content is required")
        
        if len(comment_update.content) > 500:
            raise HTTPException(status_code=400, detail="Comment must be 500 characters or less")
        
        comment = comments_collection.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # Check if user is the author
        if str(comment["author"]) != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="You can only edit your own comments")
        
        # Update comment
        updated_comment = comments_collection.find_one_and_update(
            {"_id": ObjectId(comment_id)},
            {
                "$set": {
                    "content": comment_update.content.strip(),
                    "updatedAt": datetime.utcnow()
                }
            },
            return_document=True
        )
        
        # Add author info
        updated_comment["author"] = {"_id": str(current_user["_id"]), "username": current_user["username"]}
        
        return serialize_object_id(updated_comment)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail="Invalid comment ID")

@app.get("/")
async def root():
    return {"message": "Vote App FastAPI Backend", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)