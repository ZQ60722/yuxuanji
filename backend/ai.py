from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 临时允许所有来源，生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    deep_thinking: bool=False
    max_tokens:int = 400



@app.post("/chat")
async def chat(request: ChatRequest):
    user_input = request.message
    
    # 调用外部 AI 模型的 API
    api_url = "https://api.siliconflow.cn/v1/chat/completions"
    headers = {
        "Authorization": "Bearer sk-ncflzirrrbyxcteyirnktrsfjvtlijnfwjjvfaeddzuvhtsv",  # 添加Bearer前缀
        "Content-Type": "application/json"
    }
    payload = {
        "model": "THUDM/GLM-4.1V-9B-Thinking",
        "messages": [{"role": "user", "content": user_input}],
        "max_tokens": request.max_tokens
    }
    
    try:
        logger.info(f"发送请求到AI API: {user_input}")
        response = requests.post(api_url, json=payload, headers=headers)
        logger.info(f"AI API响应状态码: {response.status_code}")
        logger.info(f"AI API响应内容: {response.text}")
        
        response.raise_for_status()
        ai_response = response.json()
        
        # 提取实际的回复内容
        if "choices" in ai_response and len(ai_response["choices"]) > 0:
            ai_message = ai_response["choices"][0]["message"]["content"]
        else:
            raise HTTPException(status_code=500, detail="AI响应格式不正确")
            
    except requests.RequestException as e:
        logger.error(f"请求AI API失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"请求AI API失败: {str(e)}")
    except Exception as e:
        logger.error(f"处理AI响应时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理AI响应时出错: {str(e)}")
    
    # 返回AI的响应
    return {"response": ai_message}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
