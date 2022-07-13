import datetime
import hashlib
from datetime import timedelta

import jwt
from flask import Flask, render_template, jsonify, request, redirect, url_for
from pymongo import MongoClient

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

# JWT 키
SECRET_KEY = 'SPARTA'

client = MongoClient(host='localhost', port=27017)
db = client.dbsparta_plus_week4


# ------------------------------로그인, 회원가입(중복확인 등)----------------------------------
# 루트 페이지 랜더링

# flask에서 html 렌더링 시 -> nickname값이 안넘어갔음

@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # user_info = db.users.find_one({"username": payload["id"]})
        return render_template('index.html')
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# 2.로그인시 로그인 페이지로 넘어감
# 로그인 폼으로 렌더링, msg 파라미터를 같이 전달
@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)


# 3.로그인 서버
# 로그인 창, 로그인 성공,실패 알려줌, nickname receive는 사용여부에 따라 삭제가능. 있어도 상관없음. 토큰유지 2시간
@app.route('/api/login')
def user(username):
    # 각 사용자의 프로필과 글을 모아볼 수 있는 공간
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        status = (username == payload["id"])  # 내 프로필이면 True, 다른 사람 프로필 페이지면 False

        user_info = db.users.find_one({"username": username}, {"_id": False})
        return render_template('user.html', user_info=user_info, status=status)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))




@app.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    return jsonify({'result': 'success'})


 # 4. 회원가입 서버
# 회원가입 api /회원 정보를 받아 비밀번호를 해쉬 처리하여 db에 저장

@app.route('/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']


    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "username": username_receive,                               # 아이디
        "password": password_hash                                 # 비밀번호

    # DB에 저장
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})



# 아이디 중복 확인
@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    username_receive = request.form['username_give']
    # 받은 username을 통해 users 디비에서 조회, None 이 아니면(유저가 있으면) bool 을 통해 True 반환, None 이라면 False
    exists = bool(db.users.find_one({"id": username_receive}))
    return jsonify({'result': 'success', 'exists': exists})


 #닉네임 중복 확인
@app.route('/sign_up/nickcheck_dup', methods=['POST'])
def nickcheck_dup():
    # ajax를 통해 받은 nick 값
    nick_receive = request.form['nick_give']

    # 받은 nick 를 통해 users에서 조회, None 이 아니면(유저가 있으면) bool 을 통해 True >>반환 , None >>False
    exists = bool(db.users.find_one({"nick": nick_receive}))
    return jsonify({'result': 'success', 'exists': exists})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)