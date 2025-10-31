from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# React와 연동 시 필요한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 나중에 보안 위해 localhost로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}
