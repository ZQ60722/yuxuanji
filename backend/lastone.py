from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List
import random
import logging
from fastapi.middleware.cors import CORSMiddleware

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境应该设置为具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

# 简单的问答对
qa_pairs = {
    "你好": "你好！有什么可以帮助你的吗？",
    "你是谁": "我是一个AI助手，目前还在开发中。",
    "天气": "抱歉，我暂时无法查询天气信息。",
    "谢谢": "不客气！",
    "再见": "再见，期待下次为您服务！"
}

@app.post("/chat")
async def chat(question: Question):
    user_input = question.message.strip()
    logger.info(f"Received question: {user_input}")  # 日志记录收到的提问

    # 简单关键词匹配
    for keyword, response in qa_pairs.items():
        if keyword in user_input:
            logger.info(f"Matched keyword: {keyword}, responding with: {response}")  # 日志记录匹配到的关键词和响应
            return {"response": response}
    
    # 默认回复
    default_responses = [
        "我正在学习中，暂时无法回答这个问题。",
        "这个问题有点难，我需要更多学习才能回答。",
        "抱歉，我不太明白你的问题。"
    ]
    response = random.choice(default_responses)
    logger.info(f"No keyword matched, responding with default response: {response}")  # 日志记录默认响应
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting the server...")  # 日志记录服务器启动
    uvicorn.run(app, host="127.0.0.1", port=8000)
