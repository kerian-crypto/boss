from queue import Full
import random
from flask import Flask, render_template, jsonify, request
import requests
from datetime import datetime
import time


app = Flask(__name__)

URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "*/*",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Origin": "https://p2p.binance.com",
    "Referer": "https://p2p.binance.com/",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    )
}


def fetch_p2p_usdt(trade_type="BUY", fiat="XAF", rows=20):
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

        json_data = r.json()

        if "data" not in json_data or json_data["data"] is None:
            print("Données absentes ou vides depuis Binance")
            return []

        data = json_data["data"]

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
        return generate_test_data(trade_type, rows)

def generate_test_data(trade_type, count):
    """Génère des données de test pour 30 annonces"""
    base_price = 600 if trade_type == "BUY" else 620
    data = []
    
    for i in range(count):
        # Variation de prix réaliste
        price_variation = random.uniform(-10, 10)
        price = base_price + price_variation
        
        data.append({
            "price": round(price, 2),
            "volume": round(random.uniform(50, 300), 2),
            "min": round(random.uniform(100, 300), 2),
            "max": round(random.uniform(1000, 5000), 2),
            "payments": ["BANK_TRANSFER"]
        })
    
    # Trier par prix
    return sorted(data, key=lambda x: x["price"], reverse=(trade_type == "SELL"))
def calculate_candlestick_data(rates):
    """Calcule les données OHLC (Open, High, Low, Close) pour les chandeliers"""
    if not rates:
        return None
    
    # Trier les taux par prix pour obtenir une vue significative
    sorted_rates = sorted(rates, key=lambda x: x["price"])
    
    if len(sorted_rates) < 2:
        # Si moins de 2 offres, créer un chandelier simple
        price = sorted_rates[0]["price"] if sorted_rates else 0
        return {
            "open": price,
            "high": price,
            "low": price,
            "close": price,
            "volume": sorted_rates[0]["volume"] if sorted_rates else 0,
            "count": len(sorted_rates)
        }
    
    # Pour un vrai chandelier OHLC
    open_price = sorted_rates[0]["price"]
    close_price = sorted_rates[-1]["price"]
    high_price = max(r["price"] for r in sorted_rates)
    low_price = min(r["price"] for r in sorted_rates)
    total_volume = sum(r["volume"] for r in sorted_rates)
    
    return {
        "open": open_price,
        "high": high_price,
        "low": low_price,
        "close": close_price,
        "volume": total_volume,
        "count": len(sorted_rates)
    }
@app.route('/')
def index():
    """Page principale"""
    return render_template('index.html')

@app.route('/api/rates')
def get_rates():
    """API endpoint pour récupérer les taux actuels (30 annonces)"""
    try:
        # Récupérer 30 annonces d'achat et 30 de vente
        buy_rates = fetch_p2p_usdt("BUY","XAF", rows=20)
        sell_rates = fetch_p2p_usdt("SELL","XAF", rows=20)
        
        # Calculer les chandeliers
        buy_candle = calculate_candlestick_data(buy_rates)
        sell_candle = calculate_candlestick_data(sell_rates)
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return jsonify({
            "success": True,
            "timestamp": timestamp,
            "buy": {
                "rates": buy_rates,
                "candle": buy_candle
            },
            "sell": {
                "rates": sell_rates,
                "candle": sell_candle
            }
        })
    except Exception as e:
        print(f"Erreur dans /api/rates: {e}")
        # En cas d'erreur, retourner des données de test
        return generate_test_data()
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
    
price_history = {
    'buy': [],
    'sell': []
}

@app.route('/api/history/candle', methods=['POST'])
def add_candle_to_history():
    """Ajoute un chandelier à l'historique"""
    global price_history
    
    try:
        data = request.json
        buy_candle = data.get('buy')
        sell_candle = data.get('sell')
        timestamp = datetime.now().isoformat()
        
        if buy_candle:
            price_history['buy'].append({
                'timestamp': timestamp,
                'open': buy_candle['open'],
                'high': buy_candle['high'],
                'low': buy_candle['low'],
                'close': buy_candle['close'],
                'volume': buy_candle['volume']
            })
            
        if sell_candle:
            price_history['sell'].append({
                'timestamp': timestamp,
                'open': sell_candle['open'],
                'high': sell_candle['high'],
                'low': sell_candle['low'],
                'close': sell_candle['close'],
                'volume': sell_candle['volume']
            })
            
        # Garder seulement les 50 derniers chandeliers
        price_history['buy'] = price_history['buy'][-50:]
        price_history['sell'] = price_history['sell'][-50:]
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/history/candle')
def get_candle_history():
    """Récupère l'historique des chandeliers"""
    return jsonify({
        'success': True,
        'buy': price_history['buy'],
        'sell': price_history['sell']})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
