from flask import Flask, render_template, request, jsonify
import os
import requests
from dotenv import load_dotenv
import re

# Tải biến môi trường từ .env
load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv('OPENWEATHER_API_KEY')
if not API_KEY:
    print("OPENWEATHER_API_KEY không được thiết lập. Chương trình sẽ thoát.")
    exit(1)

# Hàm lọc tên thành phố
def validate_city(city):
    if not city:
        return False, "Tên thành phố không được để trống!"
    city = city.strip()
    if not re.match(r'^[a-zA-ZÀ-ỹ\s]+$', city):
        return False, "Tên thành phố không hợp lệ! Chỉ chấp nhận chữ cái và khoảng trắng."
    return True, city

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather', methods=['GET'])
def weather():
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if city:
        is_valid, message_or_city = validate_city(city)
        if not is_valid:
            return jsonify({"error": message_or_city})
        city = message_or_city
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric&lang=vi"
    elif lat and lon:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=vi"
    else:
        return jsonify({"error": "Vui lòng cung cấp tên thành phố hoặc tọa độ!"})

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        weather_data = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind_speed": data["wind"]["speed"],
            "description": data["weather"][0]["description"].capitalize(),
            "icon": f"http://openweathermap.org/img/wn/{data['weather'][0]['icon']}@2x.png"
        }
        return jsonify(weather_data)
    elif response.status_code == 401:
        return jsonify({"error": "API key không hợp lệ!"})
    else:
        return jsonify({"error": "Không tìm thấy dữ liệu thời tiết!"})

if __name__ == '__main__':
    app.run(debug=True)

#  API_KEY = "ce75a21f9c503e5d4617a91f93fea050" 
# Lấy API key từ biến môi trường