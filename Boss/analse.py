import requests
import time

URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"

HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}

def fetch_p2p_usdt(trade_type="BUY", fiat="XAF", rows=10):
    payload = {
        "asset": "USDT",
        "fiat": fiat,
        "tradeType": trade_type,  # BUY ou SELL
        "page": 1,
        "rows": rows,
        "payTypes": [],
        "publisherType": None
    }

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

# Exemple
buy_rates = fetch_p2p_usdt("BUY")
sell_rates = fetch_p2p_usdt("SELL")

print("BUY:", buy_rates[:3])
print("SELL:", sell_rates[:3])
