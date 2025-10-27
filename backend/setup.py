import sqlite3
import pandas as pd
import os

def setup_database_from_excel(excel_file_path):
    """
    从指定的Excel文件中读取术语库，并导入到SQLite数据库中。
    """
    # 检查Excel文件是否存在
    if not os.path.exists(excel_file_path):
        print(f"错误：找不到Excel文件 '{excel_file_path}'。请确保文件存在于脚本同级目录下。")
        return

    # 连接到数据库（如果不存在则会创建）
    conn = sqlite3.connect('knowledge_base.db')
    cursor = conn.cursor()

    # 创建术语表
    # 注意：我们增加了一个 'category' 列来存储“专业”信息
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS glossary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        term TEXT NOT NULL UNIQUE,
        definition TEXT NOT NULL
    )
    ''')

    try:
        # 使用pandas读取Excel文件
        # header=0 表示第一行是列名
        df = pd.read_excel(excel_file_path, header=0)
        
        # 检查Excel中是否包含必要的列
        required_columns = ['专业方向', '名词', '介绍']
        if not all(col in df.columns for col in required_columns):
            print(f"错误：Excel文件中缺少必要的列。请确保包含以下列名：{', '.join(required_columns)}")
            return

        # 将DataFrame转换为元组列表，以便插入数据库
        # 我们只选择需要的列，并按顺序排列
        data_to_insert = [tuple(x) for x in df[['专业', '名词', '介绍']].values]

        # 使用 INSERT OR IGNORE 避免重复插入
        # 注意这里的占位符数量要和插入的列数匹配
        cursor.executemany('INSERT OR IGNORE INTO glossary (category, term, definition) VALUES (?, ?, ?)', data_to_insert)
        
        # 提交事务
        conn.commit()
        print(f"成功从 '{excel_file_path}' 导入了 {len(data_to_insert)} 条术语到数据库！")

    except Exception as e:
        print(f"处理Excel文件时发生错误: {e}")
        # 如果出错，回滚事务
        conn.rollback()

    finally:
        # 关闭连接
        conn.close()

if __name__ == '__main__':
    excel_file = "D:\untitled\nextone\backend\术语库.xlsx"
    setup_database_from_excel(excel_file)
