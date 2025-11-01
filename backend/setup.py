import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='33238',
        database='test_db',
        port=3306,
        connect_timeout=10
    )
    print("连接成功！")
    connection.close()
except Exception as e:
    print(f"连接失败: {e}")
