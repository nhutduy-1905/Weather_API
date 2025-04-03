
from flask import Flask, render_template, request, jsonify, session
import requests
app = Flask(__name__)
app.secret_key = "supersecretkey"  # Khóa bí mật để lưu session
API_KEY = "ce75a21f9c503e5d4617a91f93fea050" 
@app.route('/')
def index():
    history = session.get("history", [])  # Lấy lịch sử tìm kiếm từ session
    return render_template('index.html', history=history)
@app.route('/weather', methods=['GET'])
def weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "Vui lòng nhập tên thành phố!"})
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric&lang=vi"
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
        # Lưu vào lịch sử tìm kiếm
        history = session.get("history", [])
        if weather_data["city"] not in history:
            history.append(weather_data["city"])
            session["history"] = history

        return jsonify(weather_data)
    else:
        return jsonify({"error": "Không tìm thấy thành phố!"})
if __name__ == '__main__':
    app.run(debug=True)