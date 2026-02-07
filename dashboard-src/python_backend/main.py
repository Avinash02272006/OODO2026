from fastapi import FastAPI, Depends, HTTPException, status, Request, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import os

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Document, Link
from passlib.context import CryptContext
from jose import JWTError, jwt

# ---- CONFIGURATION ----
SECRET_KEY = "super_secret_key_123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
MONGO_URI = "mongodb://localhost:27017" # Default local MongoDB

# ---- AUTH UTILS ----
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

def get_password_hash(password): return pwd_context.hash(password)
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ---- MODELS (Beanie Documents) ----

class User(Document):
    name: str
    email: str
    hashed_password: str
    role: str = "user" # 'admin', 'user', 'instructor'
    points: int = 0
    rank: str = "Newbie"
    badges: List[str] = [] # e.g. ["Newbie"]

    class Settings:
        name = "users"
        indexes = ["email"]

class Review(Document):
    user_id: str
    course_id: str
    rating: int
    comment: str
    created_at: str = datetime.utcnow().isoformat()
    user_name: Optional[str] = None # Denormalize for easier access

    class Settings:
        name = "reviews"

class Lesson(Document):
    title: str
    type: str # video, document, image
    category: str = "video"
    content_url: Optional[str] = ""
    description: str = ""
    duration: str = "00:00"
    allow_download: bool = False
    additional_file_url: str = ""
    additional_link: str = ""
    course_id: str # Reference to Course ID

    class Settings:
        name = "lessons"

class Question(BaseModel):
    text: str
    choices: List[dict] # [{"text": "A", "correct": False}, ...]

class QuizReward(BaseModel):
    first_try: int = 10
    second_try: int = 7
    third_try: int = 5
    fourth_plus: int = 2

class Quiz(Document):
    title: str
    course_id: str
    questions: List[Question] = []
    rewards: Optional[QuizReward] = QuizReward()

    class Settings:
        name = "quizzes"

class Course(Document):
    title: str
    image: str
    description: str = ""
    status: str = "draft" # published, draft
    price: float = 0.0
    access_type: str = "open" # open, invite, payment
    visibility: str = "everyone" # everyone, signed_in
    tags: str = "" # Comma separated
    enrollments_count: int = 0
    views_count: int = 0
    total_duration: str = "00:00"
    owner_id: Optional[str] = None
    responsible_id: Optional[str] = None
    
    # We will fetch lessons/quizzes separately or embed them depending on access needs.
    # For now, let's keep them separate documents referenced by ID for scalability.

    class Settings:
        name = "courses"

class Enrollment(Document):
    user_id: str
    course_id: str
    completed_lessons: List[str] = [] # List of Lesson IDs
    progress_percent: int = 0
    enrolled_at: str = datetime.utcnow().isoformat()

    class Settings:
        name = "enrollments"

# ---- SCHEMAS (Pydantic) ----
class UserCreate(BaseModel):
    name: str; email: str; password: str
class LoginReq(BaseModel):
    email: str; password: str

class CourseBase(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    tags: Optional[str] = None
    access_type: Optional[str] = None
    responsible_id: Optional[str] = None

class LessonCreate(BaseModel):
    title: str
    type: str 
    category: str 
    content_url: Optional[str] = ""
    duration: Optional[str] = "00:00"
    allow_download: Optional[bool] = False
    description: Optional[str] = ""
    additional_link: Optional[str] = ""

class QuizCreate(BaseModel):
    title: str

class QuestionCreate(BaseModel):
    text: str
    choices: list

class ReviewCreate(BaseModel):
    rating: int
    comment: str

# ---- APP ----
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory="python_backend/static"), name="static")

@app.on_event("startup")
async def startup_db():
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(database=client.learning_platform, document_models=[User, Course, Lesson, Quiz, Review, Enrollment])
    
    # Seed Admin
    if not await User.find_one(User.email == "admin@learnsphere.com"):
        admin = User(name="Admin User", email="admin@learnsphere.com", hashed_password=get_password_hash("password"), role="admin", points=500, rank="Master", badges=["Master"])
        await admin.insert()
        
        # Sample Course
        c1 = Course(
            title="Basics of Odoo CRM", 
            image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7", 
            description="Learn the fundamentals of Odoo CRM customization.",
            status="published",
            price=0,
            tags="Odoo,CRM,Basics",
            views_count=15,
            total_duration="02:30"
        )
        await c1.insert()

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await User.find_one(User.email == email)
    if user is None:
        raise credentials_exception
    return user

# ---- API ROUTES ----

@app.get("/")
def read_root():
    return {"message": "Welcome to the LearnSphere API (MongoDB)", "docs": "/docs"}

@app.post("/api/register")
async def register(user: UserCreate):
    if await User.find_one(User.email == user.email):
        raise HTTPException(400, "Email already exists")
    new_user = User(name=user.name, email=user.email, hashed_password=get_password_hash(user.password), role="user")
    await new_user.insert()
    token = create_access_token({"sub": new_user.email, "role": new_user.role, "id": str(new_user.id)})
    return {"token": token, "user": {"id": str(new_user.id), "name": new_user.name, "role": new_user.role}}

@app.post("/api/login")
async def login(creds: LoginReq):
    user = await User.find_one(User.email == creds.email)
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user.email, "role": user.role, "id": str(user.id)})
    return {"token": token, "user": {"id": str(user.id), "name": user.name, "role": user.role, "points": user.points, "rank": user.rank, "badges": user.badges}}

@app.get("/api/users")
async def get_users():
    users = await User.find_all().to_list()
    return users

@app.get("/api/courses")
async def get_courses():
    courses = await Course.find_all().to_list()
    # Serialize for list view
    result = []
    for c in courses:
        lessons_count = await Lesson.find(Lesson.course_id == str(c.id)).count()
        result.append({
            "id": str(c.id), "title": c.title, "image": c.image, "status": c.status, 
            "price": c.price, "tags": c.tags, "views_count": c.views_count,
            "total_duration": c.total_duration,
            "_count": {"lessons": lessons_count},
        })
    return result

@app.get("/api/courses/{id}")
async def get_course_detail(id: str):
    c = await Course.get(id)
    if not c: raise HTTPException(404, "Course not found")
    
    lessons = await Lesson.find(Lesson.course_id == id).to_list()
    quizzes = await Quiz.find(Quiz.course_id == id).to_list()
    
    return {
        "id": str(c.id), "title": c.title, "image": c.image, "description": c.description,
        "status": c.status, "price": c.price, "tags": c.tags, "access_type": c.access_type,
        "responsible_id": c.responsible_id,
        "lessons": [{
            "id": str(l.id), "title": l.title, "type": l.type, "duration": l.duration, "category": l.category
        } for l in lessons],
        "quizzes": [{
            "id": str(q.id), "title": q.title
        } for q in quizzes]
    }

@app.post("/api/courses")
async def create_course():
    c = Course(title="New Course", image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3")
    await c.insert()
    return {"id": str(c.id), "title": c.title}

@app.put("/api/courses/{id}")
async def update_course(id: str, data: CourseBase):
    c = await Course.get(id)
    if not c: raise HTTPException(404, "Course not found")
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(c, key, value)
    await c.save()
    return {"message": "Updated"}

@app.post("/api/courses/{id}/lessons")
async def create_lesson(id: str, data: LessonCreate):
    l = Lesson(**data.dict(), course_id=id)
    await l.insert()
    return {"id": str(l.id), "title": l.title} # Return simplified object or full object

@app.put("/api/lessons/{id}")
async def update_lesson(id: str, data: LessonCreate):
    l = await Lesson.get(id)
    if not l: raise HTTPException(404, "Lesson not found")
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(l, key, value)
    await l.save()
    return l

@app.delete("/api/lessons/{id}")
async def delete_lesson(id: str):
    l = await Lesson.get(id)
    if not l: raise HTTPException(404, "Lesson not found")
    await l.delete()
    return {"message": "Deleted"}

@app.delete("/api/courses/{id}")
async def delete_course(id: str):
    c = await Course.get(id)
    if not c: raise HTTPException(404, "Course not found")
    # Clean up related
    await c.delete()
    # In MongoDB we might need manual cleanup or rely on app logic
    return {"message": "Deleted"}

# ---- QUIZZES ----
@app.post("/api/courses/{id}/quizzes")
async def create_quiz(id: str, data: QuizCreate):
    q = Quiz(title=data.title, course_id=id)
    await q.insert()
    return {"id": str(q.id)}

@app.post("/api/quizzes/{id}/questions")
async def add_question(id: str, data: QuestionCreate):
    q = await Quiz.get(id)
    if not q: raise HTTPException(404, "Quiz not found")
    
    new_question = Question(text=data.text, choices=data.choices)
    q.questions.append(new_question)
    await q.save()
    return {"id": len(q.questions) - 1} # rudimentary ID

@app.get("/api/quizzes/{id}")
async def get_quiz(id: str):
    q = await Quiz.get(id)
    if not q: raise HTTPException(404, "Quiz not found")
    return {
        "id": str(q.id), "title": q.title, 
        "questions": [{"text": quest.text, "choices": quest.choices} for quest in q.questions],
        "rewards": q.rewards
    }

@app.post("/api/quizzes/{id}/rewards")
async def set_rewards(id: str, data: dict):
    q = await Quiz.get(id)
    if not q: raise HTTPException(404, "Quiz not found")
    
    if not q.rewards:
        q.rewards = QuizReward()
    
    q.rewards.first_try = data.get('first_try', 10)
    q.rewards.second_try = data.get('second_try', 7)
    q.rewards.third_try = data.get('third_try', 5)
    q.rewards.fourth_plus = data.get('fourth_plus', 2)
    
    await q.save()
    return {"status": "updated"}

# ---- ENROLLMENT ----
@app.post("/api/enroll/{course_id}")
async def enroll(course_id: str, current_user: User = Depends(get_current_user)):
    # Check if already enrolled
    existing = await Enrollment.find_one(Enrollment.user_id == str(current_user.id), Enrollment.course_id == course_id)
    if existing:
        return {"message": "Already enrolled"}
    
    e = Enrollment(user_id=str(current_user.id), course_id=course_id)
    await e.insert()
    return {"status": "enrolled"}

@app.get("/api/stats")
async def get_stats():
    courses_count = await Course.count()
    users_count = await User.count()
    enrollments_count = await Enrollment.count()
    
    revenue = 0
    enrollments = await Enrollment.find_all().to_list()
    for e in enrollments:
        c = await Course.get(e.course_id)
        if c: revenue += c.price

    return {
        "total_courses": courses_count,
        "total_users": users_count,
        "total_enrollments": enrollments_count,
        "total_revenue": revenue,
        "recent_activity": []
    }

@app.post("/api/courses/{course_id}/reviews")
async def add_review(course_id: str, review: ReviewCreate, current_user: User = Depends(get_current_user)):
    new_review = Review(
        user_id=str(current_user.id),
        course_id=course_id,
        rating=review.rating,
        comment=review.comment,
        user_name=current_user.name
    )
    await new_review.insert()
    return {"status": "success"}

@app.get("/api/courses/{course_id}/reviews")
async def get_reviews(course_id: str):
    reviews = await Review.find(Review.course_id == course_id).to_list()
    return [{
        "id": str(r.id),
        "user_name": r.user_name or "Unknown",
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at
    } for r in reviews]

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = f"python_backend/static/{file.filename}"
    os.makedirs("python_backend/static", exist_ok=True)
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    return {"url": f"http://localhost:8000/static/{file.filename}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
