from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from deep_translator import MyMemoryTranslator
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 临时允许所有来源，生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API配置
API_URL = "https://api.siliconflow.cn/v1/chat/completions"
HEADERS = {
    "Authorization": "Bearer sk-ncflzirrrbyxcteyirnktrsfjvtlijnfwjjvfaeddzuvhtsv",
    "Content-Type": "application/json"
}

EVALUATION_PROMPT = """
你是一个高效的翻译评估专家。请从以下几个维度快速评估用户的翻译文本：
1. 准确性 (Accuracy) - 翻译是否准确传达了原文意思
2. 流畅性 (Fluency) - 译文是否自然流畅，符合目标语言表达习惯
3. 完整性 (Completeness) - 是否完整翻译了原文内容，有无遗漏
4. 语法正确性 (Grammar) - 语法是否正确，用词是否恰当
5. 风格一致性 (Style) - 译文风格是否与原文保持一致

请为每个维度给出1-10分的评分，并提供简洁的改进建议。
最后给出总分和综合评价，每一个建议都不超过20个字，建议不超过25个字精简一点。

请按照以下格式回复：
---
准确性：X/10
[具体评价]

流畅性：X/10
[具体评价]

完整性：X/10
[具体评价]

语法正确性：X/10
[具体评价]

风格一致性：X/10
[具体评价]

总分：XX/50
综合评价：[一句话总结]
改进建议：[1-2条核心建议]
---
"""

# 定义请求模型
class ReferenceRequest(BaseModel):
    text: str
    direction: str = "zh-to-en"

class EvaluationRequest(BaseModel):
    original_text: str
    translated_text: str
    direction: str = "zh-to-en"

@app.post('/api/generate-reference')
async def generate_reference(request: ReferenceRequest):
    try:
        print(f"接收到的数据: {request}")
        
        text = request.text.strip()
        direction = request.direction
        
        if not text:
            raise HTTPException(status_code=400, detail={'error': '原文不能为空'})
        
        # 根据方向配置翻译器
        if direction == 'zh-to-en':
            translator = MyMemoryTranslator(source='zh-CN', target='en-GB')
        else:
            translator = MyMemoryTranslator(source='en-GB', target='zh-CN')
        
        print(f"开始翻译: {text} ({direction})")
        reference_translation = translator.translate(text)
        print(f"翻译结果: {reference_translation}")
        
        return {
            'reference_translation': reference_translation
        }
        
    except Exception as e:
        print(f"错误详情: {str(e)}")
        raise HTTPException(status_code=500, detail={'error': f'生成参考译文失败：{str(e)}'})

@app.post('/api/evaluate-translation')
async def evaluate_translation(request: EvaluationRequest):
    try:
        original_text = request.original_text.strip()
        translated_text = request.translated_text.strip()
        direction = request.direction
        
        if not original_text or not translated_text:
            raise HTTPException(status_code=400, detail={'error': '原文和译文都不能为空'})
        
        # 生成参考译文
        if direction == 'zh-to-en':
            reference_translator = MyMemoryTranslator(source='zh-CN', target='en-GB')
        else:
            reference_translator = MyMemoryTranslator(source='en-GB', target='zh-CN')
        
        reference_translation = reference_translator.translate(original_text)
        
        # 构建评估请求
        full_prompt = f"""{EVALUATION_PROMPT}

原文：{original_text}
用户译文：{translated_text}
参考译文：{reference_translation}

请参考上述参考译文，对用户的翻译进行客观评估。参考译文可以作为评估准确性的重要依据，但也要考虑翻译的多样性和表达方式的差异。
"""
        
        # 发送API请求
        payload = {
            "model": "THUDM/GLM-4.1V-9B-Thinking",
            "messages": [{"role": "user", "content": full_prompt}],
            "max_tokens": 600,
            "temperature": 0.1
        }
        
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            evaluation = result['choices'][0]['message']['content']
            
            return {
                'evaluation': evaluation,
                'reference_translation': reference_translation
            }
        else:
            raise HTTPException(status_code=500, detail={'error': f'API请求失败：{response.status_code}'})
            
    except Exception as e:
        print(f"评估错误详情: {str(e)}")
        raise HTTPException(status_code=500, detail={'error': f'评估失败：{str(e)}'})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=5000)
