# main_rag.py
import requests
import sqlite3
import json

# --- 配置信息 ---
API_KEY = 'sk-ncflzirrrbyxcteyirnktrsfjvtlijnfwjjvfaeddzuvhtsv'
MODEL_NAME = 'THUDM/GLM-4.1V-9B-Thinking'
API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
DB_PATH = 'knowledge_base.db'

def retrieve_relevant_info(user_question: str) -> str:
    """
    从SQLite数据库中检索与用户问题相关的术语定义。
    这是一个简单的关键词匹配检索。
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 获取所有术语和定义
    cursor.execute("SELECT term, definition FROM glossary")
    all_terms = cursor.fetchall()
    conn.close()

    relevant_info = []
    # 简单的检索逻辑：检查用户问题是否包含任何术语
    for term, definition in all_terms:
        if term.lower() in user_question.lower():
            relevant_info.append(f"术语: {term}\n定义: {definition}")
    
    # 如果没有找到任何相关术语，返回空字符串
    return "\n\n".join(relevant_info)

def ask_ai_with_rag(user_question: str):
    """
    使用RAG流程向AI提问
    """
    # 1. 检索
    retrieved_context = retrieve_relevant_info(user_question)
    
    # 2. 构建增强的提示词
    if retrieved_context:
        # 如果检索到了信息，就把它放进prompt里，并要求AI基于此回答
        system_prompt = (
            "你是一个专业的AI助手。请根据下面提供的【背景资料】来回答用户的问题。"
            "你的回答应该主要基于这些资料，如果资料不足以回答问题，请明确指出。"
            "不要编造资料中没有的信息。\n\n"
            f"【背景资料】:\n{retrieved_context}\n\n"
            "现在，请回答以下问题："
        )
    else:
        # 如果没检索到信息，就让AI正常回答
        system_prompt = "请直接回答用户的问题。"

    # 3. 调用AI API
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {API_KEY}'
    }

    data = {
        'model': MODEL_NAME,
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_question}
        ],
        'max_tokens': 1000,
        'temperature': 0.7
    }

    try:
        response = requests.post(API_URL, json=data, headers=headers)
        if response.status_code == 200:
            answer = response.json()['choices'][0]['message']['content']
            return answer
        else:
            return f"API调用出错: {response.status_code}, {response.text}"
    except Exception as e:
        return f"发生异常: {e}"

# --- 主程序 ---
if __name__ == '__main__':
    # 确保数据库已设置
    # import setup_database
    # setup_database.setup_database()

    # 测试问题
    question1 = "什么是检索增强生成？"
    question2 = "API是干什么的？"
    question3 = "今天天气怎么样？" # 这个问题术语库里没有

    print(f"问题: {question1}")
    print(f"AI回答:\n{ask_ai_with_rag(question1)}\n{'-'*40}")

    print(f"问题: {question2}")
    print(f"AI回答:\n{ask_ai_with_rag(question2)}\n{'-'*40}")
    
    print(f"问题: {question3}")
    print(f"AI回答:\n{ask_ai_with_rag(question3)}\n{'-'*40}")
