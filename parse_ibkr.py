import re, json

text = open('/tmp/ibkr_history_pdf.txt').read()
matches = re.findall(r'(Buy|Sell)\s+([A-Z]+)\s+([-\d\.]+)\s+([-\d\.]+)\s+USD', text)

trades = {}
for action, sym, qty_str, price_str in matches:
    qty = abs(float(qty_str))
    price = float(price_str)
    if sym not in trades:
        trades[sym] = {'qty': 0, 'cost': 0}
    
    if action == 'Buy':
        trades[sym]['qty'] += qty
        trades[sym]['cost'] += qty * price
    elif action == 'Sell':
        if trades[sym]['qty'] > 0:
            avg = trades[sym]['cost'] / trades[sym]['qty']
            trades[sym]['cost'] -= qty * avg
        trades[sym]['qty'] -= qty

name_map = {
    'IVV': 'ISHARES CORE S&P 500 ETF', 
    'PHYS': 'SPROTT PHYSICAL GOLD TRUST', 
    'PLTR': 'PALANTIR TECHNOLOGIES INC-A', 
    'TSLA': 'TESLA INC', 
    'URA': 'GLOBAL X URANIUM ETF', 
    'QQQ':'INVESCO QQQ TRUST SERIES 1'
}

results = []
for sym, data in trades.items():
    if data['qty'] > 0.0001:
        avg = data['cost'] / data['qty'] if data['qty'] > 0 else 0
        results.append({
            'symbol': sym,
            'name': name_map.get(sym, sym),
            'type': 'stock',
            'quantity': round(data['qty'], 4),
            'avgBuyPrice': round(avg, 2),
            'currentPrice': round(avg, 2),
            'currentPriceUSD': round(avg, 2)
        })

print(json.dumps(results, indent=4))
