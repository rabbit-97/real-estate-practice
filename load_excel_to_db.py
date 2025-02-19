import sqlite3
import pandas as pd

# CSV 파일 경로
csv_file_path = '국토교통부_법정동코드_20240805.csv'

def load_csv_to_db(csv_path):
    # SQLite 데이터베이스 연결
    conn = sqlite3.connect('법정동코드.db')
    cursor = conn.cursor()

    # 테이블 생성
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS 법정동코드 (
            법정동코드 TEXT PRIMARY KEY,
            법정동명 TEXT
        )
    ''')

    # CSV 파일을 DataFrame으로 읽기
    df = pd.read_csv(csv_path, encoding='euc-kr')

    # 데이터 삽입
    for _, row in df.iterrows():
        cursor.execute('''
            INSERT OR REPLACE INTO 법정동코드 (법정동코드, 법정동명) VALUES (?, ?)
        ''', (row['법정동코드'], row['법정동명']))

    # 변경사항 저장 및 연결 종료
    conn.commit()
    conn.close()

# CSV 파일을 데이터베이스로 로드
load_csv_to_db(csv_file_path) 