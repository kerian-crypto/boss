from flask import Flask, render_template, jsonify
import requests
from datetime import datetime
import time

app = Flask(__name__)

URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}

def fetch_p2p_usdt(trade_type="BUY", fiat="XAF", rows=10):
    """Récupère les données P2P de Binance"""
    payload = {
        "asset": "USDT",
        "fiat": fiat,
        "tradeType": trade_type,
        "page": 1,
        "rows": rows,
        "payTypes": [],
        "publisherType": None
    }
    try:
        r = requests.post(URL, json=payload, headers=HEADERS, timeout=10)
        r.raise_for_status()
        data = r.json()["data"]
        return [
            {
                "price": float(ad["adv"]["price"]),
                "min": float(ad["adv"]["minSingleTransAmount"]),
                "max": float(ad["adv"]["maxSingleTransAmount"]),
                "volume": float(ad["adv"]["tradableQuantity"]),
                "payments": [p["payType"] for p in ad["adv"]["tradeMethods"]]
            }
            for ad in data
        ]
    except Exception as e:
        print(f"Erreur lors de la récupération des données: {e}")
        return []

def calculate_candlestick_data(rates):
    """Calcule les données OHLC (Open, High, Low, Close) pour les chandeliers"""
    if not rates:
        return None
    
    prices = [rate["price"] for rate in rates]
    volumes = [rate["volume"] for rate in rates]
    
    return {
        "open": prices[0] if prices else 0,
        "high": max(prices) if prices else 0,
        "low": min(prices) if prices else 0,
        "close": prices[-1] if prices else 0,
        "volume": sum(volumes) if volumes else 0,
        "count": len(prices)
    }

@app.route('/')
def index():
    """Page principale"""
    return render_template('index.html')

@app.route('/api/rates')
def get_rates():
    """API endpoint pour récupérer les taux actuels"""
    try:
        buy_rates = fetch_p2p_usdt("BUY")
        sell_rates = fetch_p2p_usdt("SELL")
        
        buy_candle = calculate_candlestick_data(buy_rates)
        sell_candle = calculate_candlestick_data(sell_rates)
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return jsonify({
            "success": True,
            "timestamp": timestamp,
            "buy": {
                "rates": buy_rates[:10],
                "candle": buy_candle
            },
            "sell": {
                "rates": sell_rates[:10],
                "candle": sell_candle
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/history')
def get_history():
    """API endpoint pour récupérer l'historique des taux"""
    try:
        history = []
        for i in range(20):
            buy_rates = fetch_p2p_usdt("BUY")
            sell_rates = fetch_p2p_usdt("SELL")
            
            if buy_rates and sell_rates:
                buy_candle = calculate_candlestick_data(buy_rates)
                sell_candle = calculate_candlestick_data(sell_rates)
                
                timestamp = int(time.time() * 1000) - (i * 300000)  # 5 min intervals
                
                history.append({
                    "timestamp": timestamp,
                    "buy": buy_candle,
                    "sell": sell_candle
                })
            
            if i < 19:
                time.sleep(2)
        
        history.reverse()
        return jsonify({
            "success": True,
            "data": history
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
