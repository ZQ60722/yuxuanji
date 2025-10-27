from flask import Flask, jsonify, request
import jieba
import re
app = Flask(__name__)
import sqlite3
import os
from docx import Document
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 启用 CORS

def create_table(cursor,table_name):
    cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS "{table_name}" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chinese TEXT NOT NULL,
            english TEXT NOT NULL
        )
    ''')

def insert_terms(cursor,table_name,terms):
    cursor.execute(f'DROP TABLE IF EXISTS {table_name}')
    create_table(cursor,table_name)
    for chinese,english in terms.items():
        cursor.execute(f'SELECT * FROM {table_name} WHERE chinese = ? AND english = ?',(chinese,english))
        if cursor.fetchone() is None:
            cursor.execute(f'INSERT INTO {table_name} (chinese, english) VALUES (?, ?)', (chinese,english))

#修改1，该方法全改
def load_dict(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        data = {}
        for line in lines:
            line = line.strip()
            if not line:
                continue
            match = re.match(r'([^\s]+)\s+([^\s]+)', line.strip())
            if match:
                chinese = match.group(1)
                english = match.group(2).strip()
                data[chinese] = english
            else:
                print(f"警告：无法解析行: {line}")
    return data    

def add_dict(dictpath):
    jieba.load_userdict(dictpath)
categories = {
    "材料学",
    "农学",
    "生命科学",
    "社会学",
    "心理学",
    "教育学",
    "环境科学",
    "金融",
    "旅游"
}

def query_translation(chinese_text):
    conn = sqlite3.connect('terms.db')
    cursor = conn.cursor()
    
    for cate in categories:
        cursor.execute(f"""
            SELECT english FROM "{cate}" WHERE chinese = ?""", (chinese_text,))
        result = cursor.fetchone()    
        if result:
            return result[0]
    conn.close()
#修改2，该方法全改
def translate_file(file_path):
    conn = sqlite3.connect('terms.db')
    cursor = conn.cursor()
    if file_path.endswith('.docx'):
        doc = Document(file_path)
        full_text = []
        for para in doc.paragraphs: 
            full_text.append(para.text)
    elif file_path.endswith('.txt'):
        with open (file_path,'r',encoding='utf-8') as f:
            full_text = f.readlines()
    else:
        raise ValueError("不支持的文件类型，仅支持 .txt 和 .docx 文件")
    
    translations = set()               
    for line in full_text:
        line = line.strip()
        if not line:
            continue
        words = jieba.lcut(line)
        for word in words:
            translation = query_translation(word)
            if translation:
                translations.add(frozenset({word: translation}.items()))
            else:
                continue    
    conn.close()
    translations = [dict(items) for items in translations]
    return translations

def main():
    conn = sqlite3.connect('terms.db')
    cursor = conn.cursor()
    #修改3，把路径换成csv文件的路径，类别名留着不用改  
    file_categories = {
        'D:/untitled/nextone/backend/lan/材料学.txt': '材料学',
        'D:/untitled/nextone/backend/lan/农学.txt': '农学',
        'D:/untitled/nextone/backend/lan/生命科学.txt': '生命科学',
        'D:/untitled/nextone/backend/lan/社会学.txt': '社会学',
        'D:/untitled/nextone/backend/lan/心理学.txt': '心理学',
        'D:/untitled/nextone/backend/lan/教育学.txt': '教育学',
        'D:/untitled/nextone/backend/lan/环境科学.txt': '环境科学',
        'D:/untitled/nextone/backend/lan/金融.txt': '金融',
        'D:/untitled/nextone/backend/lan/旅游.txt': '旅游'
    }
    
    for file, category in file_categories.items():
        dict=load_dict(file)
        create_table(cursor,category)
        insert_terms(cursor,category,dict)
    conn.commit()
    conn.close()

#修改4，改路径，csv
FILE_PATHS = {
    'nx': 'D:/untitled/nextone/backend/lan/农学.txt',
    'clx': 'D:/untitled/nextone/backend/lan/材料学.txt',
    'jyx': 'D:/untitled/nextone/backend/lan/教育学.txt',
    'shx': 'D:/untitled/nextone/backend/lan/社会学.txt',
    'xlx': 'D:/untitled/nextone/backend/lan/心理学.txt',
    'hjkx': 'D:/untitled/nextone/backend/lan/环境科学.txt',
    'ly': 'D:/untitled/nextone/backend/lan/旅游.txt',
    'jr': 'D:/untitled/nextone/backend/lan/金融.txt',
    'smkx': 'D:/untitled/nextone/backend/lan/生命科学.txt'
}


@app.route('/search', methods=['GET'])
def search():
  
    search_term = request.args.get('term', '').strip()
    results = []

    conn = sqlite3.connect('terms.db')
    cursor = conn.cursor()

    for category in categories:
        cursor.execute(f"""
            SELECT chinese,english 
            FROM "{category}" WHERE chinese LIKE ? OR english LIKE ?
            """,(f'%{search_term}%',f'%{search_term}%'))
   
        rows = cursor.fetchall()
        for row in rows:
            results.append({
                'chinese': row[0],
                'english': row[1],
                'category': category
            })

    conn.close()

   
    return jsonify(results)

@app.route('/api/words/<string:note_id>', methods=['GET'])
def get_words(note_id):
    if note_id not in FILE_PATHS:
        return jsonify({'error': 'Invalid note ID'}), 404
    
    file_path = FILE_PATHS[note_id]
    data = load_dict(file_path)
    return jsonify(data)


current= os.path.dirname(os.path.abspath(__file__))
wenjiajia = os.path.join(current,'uploads')
if not os.path.exists(wenjiajia):
    os.makedirs(wenjiajia)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "没有文件部分"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "没有选择文件"}), 400
    
    if file:
        filename = secure_filename(file.filename) 
        saved_path = os.path.join(wenjiajia, filename)
        file.save(saved_path)
        
        try:
            print(saved_path)
            return jsonify({"success": True, "filePath": saved_path}), 200
        except Exception as e:
            print(f"处理文件时出错: {e}")
            return jsonify({"success": False, "message": "处理文件出错"}), 500

# @app.route('/translate',methods = ['POST'])
# def translate():
#     data = request.get_json()
#     file_path = data.get('filePath')
#     if not file_path or not os.path.exists(file_path):
#         return jsonify({"success": False, "message": "无效的文件路径"}), 400

#     try:
#         results = translate_file(file_path) 
#         print(results)
#         return jsonify({"success": True, "translations": results}), 200
        
#     except Exception as e:
#         print(f"翻译文件时出错: {e}")
#         return jsonify({"success": False, "message": "翻译出错"}), 500
@app.route('/translate', methods=['POST'])
def translate():
    print("--- 收到新的翻译请求 ---") # 1. 请求开始标记
    
    # 2. 打印原始的、未经任何处理的请求数据
    raw_data = request.get_data()
    print(f"接收到的原始JSON数据: {raw_data.decode('utf-8')}")

    data = request.get_json()
    print(f"解析后的Python对象: {data}") # 3. 打印解析后的对象

    file_path = data.get('filePath')
    print(f"提取出的filePath: {file_path}") # 4. 打印提取出的路径

    # 5. 在调用 translate_file 之前，先检查文件是否存在，以及它的真实信息
    if not file_path:
        print("错误: filePath为空")
        return jsonify({"success": False, "message": "无效的文件路径：filePath为空"}), 400

    if not os.path.exists(file_path):
        print(f"错误: 文件在服务器上不存在! 路径是: {file_path}")
        return jsonify({"success": False, "message": f"无效的文件路径：文件不存在 ({file_path})"}), 400
    
    # 如果文件存在，打印它的真实扩展名
    real_extension = os.path.splitext(file_path)[1].lower()
    print(f"服务器上文件的扩展名是: {real_extension}")

    try:
        print("准备调用 translate_file 函数...")
        results = translate_file(file_path) 
        print("translate_file 函数执行成功，结果如下:")
        print(results)
        return jsonify({"success": True, "translations": results}), 200
        
    except Exception as e:
        # 6. 捕获到任何异常时，打印完整的错误堆栈！
        import traceback
        print("!!! translate_file 函数执行出错 !!!")
        print("完整的错误信息:")
        traceback.print_exc() # 这会打印出非常详细的错误堆栈
        
        return jsonify({"success": False, "message": f"翻译出错: {str(e)}"}), 500



if __name__ == '__main__':
    add_dict('D:/untitled/nextone/backend/lan/词典.txt')
    
    main()
    app.run(host = '0.0.0.0',port=5000,debug=True)

