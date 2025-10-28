import requests
import json

def evaluate_translation():
    # API配置
    api_url = "https://api.siliconflow.cn/v1/chat/completions"
    headers = {
        "Authorization": "Bearer sk-ncflzirrrbyxcteyirnktrsfjvtlijnfwjjvfaeddzuvhtsv",
        "Content-Type": "application/json"
    }
    
    # 构建评估提示词
    evaluation_prompt = """
你是一个专业的翻译评估专家。请从以下几个维度评估用户的翻译文本：

1. 准确性 (Accuracy) - 翻译是否准确传达了原文意思
2. 流畅性 (Fluency) - 译文是否自然流畅，符合目标语言表达习惯
3. 完整性 (Completeness) - 是否完整翻译了原文内容，有无遗漏
4. 语法正确性 (Grammar) - 语法是否正确，用词是否恰当
5. 风格一致性 (Style) - 译文风格是否与原文保持一致

请为每个维度给出1-10分的评分，并提供具体的改进建议。
最后给出总分和综合评价。

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
综合评价：[总结性评价]
改进建议：[具体建议]
---
"""
    
    print("=== 翻译质量评估系统 ===")
    print("请输入原文和译文，我将从多个维度进行评估")
    print()
    
    # 获取用户输入
    print("请输入原文：")
    original_text = input().strip()
    
    print("\n请输入译文：")
    translated_text = input().strip()
    
    # 构建完整的评估请求
    full_prompt = f"{evaluation_prompt}\n\n原文：{original_text}\n\n译文：{translated_text}"
    
    # 发送API请求
    payload = {
        "model": "THUDM/GLM-4.1V-9B-Thinking",
        "messages": [{"role": "user", "content": full_prompt}],
        "max_tokens": 1000,
        "temperature": 0.3
    }
    
    try:
        print("\n正在评估翻译质量...")
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            evaluation = result['choices'][0]['message']['content']
            print("\n" + "="*50)
            print("评估结果：")
            print("="*50)
            print(evaluation)
        else:
            print(f"API请求失败，状态码：{response.status_code}")
            print(f"错误信息：{response.text}")
            
    except Exception as e:
        print(f"发生错误：{str(e)}")

# 运行评估函数
if __name__ == "__main__":
    evaluate_translation()
