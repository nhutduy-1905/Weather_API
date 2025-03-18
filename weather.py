from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_KEY = "ce75a21f9c503e5d4617a91f93fea050"  # Thay bằng API key thật

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather', methods=['GET'])
def weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "Vui lòng nhập tên thành phố!"})

    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        weather_data = {
            "city": city,
            "temperature": data["main"]["temp"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"]
        }
        return jsonify(weather_data)
    else:
        return jsonify({"error": "Không tìm thấy thành phố!"})

if __name__ == '__main__':
    app.run(debug=True)
