import sqlite3
import pandas as pd
import os

def create_database_and_tables(db_name):
    """创建数据库和表"""
    # 连接数据库（如果不存在会自动创建）
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    # 创建三个术语表
    tables = ['管理学', '经济学', '计算机']
    
    for table in tables:
        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            词汇 TEXT NOT NULL,
            解释 TEXT,
            词汇英语 TEXT,
            解释英语 TEXT
        )
        ''')
    
    conn.commit()
    print("数据库和表创建成功！")
    return conn

def import_data_from_excel(conn, excel_file):
    """从Excel文件导入数据到数据库"""
    cursor = conn.cursor()
    
    # 读取Excel文件中的所有工作表
    xls = pd.ExcelFile(excel_file)
    
    for sheet_name in xls.sheet_names:
        if sheet_name in ['管理学', '经济学', '计算机']:
            print(f"正在导入{sheet_name}数据...")
            
            # 读取当前工作表
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # 清理数据（去除空值）
            df = df.dropna(subset=['词汇'])
            
            # 插入数据
            for index, row in df.iterrows():
                cursor.execute(f'''
                INSERT INTO {sheet_name} (词汇, 解释, 词汇英语, 解释英语)
                VALUES (?, ?, ?, ?)
                ''', (
                    row['词汇'],
                    row['解释'] if pd.notna(row['解释']) else None,
                    row['词汇英语'] if pd.notna(row['词汇英语']) else None,
                    row['解释英语'] if pd.notna(row['解释英语']) else None
                ))
            
            print(f"{sheet_name}数据导入完成！")
    
    conn.commit()
    print("所有数据导入完成！")

def main():
    # 数据库文件名
    db_name = 'terminology.db'
    
    # Excel文件名（请确保Excel文件与脚本在同一目录下，或提供完整路径）
    excel_file = '术语库.xlsx'
    
    # 检查Excel文件是否存在
    if not os.path.exists(excel_file):
        print(f"错误：找不到Excel文件 '{excel_file}'")
        return
    
    try:
        # 创建数据库和表
        conn = create_database_and_tables(db_name)
        
        # 导入数据
        import_data_from_excel(conn, excel_file)
        
        # 验证数据导入
        cursor = conn.cursor()
        for table in ['管理学', '经济学', '计算机']:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"{table}表中共有 {count} 条记录")
        
    except Exception as e:
        print(f"发生错误：{str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("数据库连接已关闭")

if __name__ == "__main__":
    main()
