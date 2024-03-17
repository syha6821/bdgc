def message(domain, uid64, token): # 실제 이메일 내용
    return f"아래 링크를 클릭하면 이메일 인증이 완료됩니다.\n\n이메일 인증링크 : http://{domain}/common/activate/{uid64}/{token}\n\n감사합니다."

