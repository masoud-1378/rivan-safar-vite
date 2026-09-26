import urllib.request, re, json, time, sys
from collections import defaultdict
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

dest_keywords = {
    "روسیه": ["russia", "moscow", "petersburg"],
    "ترکیه": ["antalya", "alanya", "bodrum", "kusadasi", "marmaris", "trabzon", "van", "izmir", "cappadocia"],
    "استانبول": ["istanbul"],
    "کیش": ["kish"],
    "قشم": ["qeshm"],
    "تبریز": ["tabriz"],
    "یزد": ["yazd"],
    "مشهد": ["mashhad"],
    "گرجستان": ["georgia", "tbilisi", "batumi"],
    "ارمنستان": ["armenia", "yerevan"],
    "قطر": ["qatar", "doha"],
    "تایلند": ["thailand", "bangkok", "phuket", "pattaya"],
    "ژاپن": ["japan", "tokyo"],
    "کره جنوبی": ["korea", "seoul"],
    "فرانسه": ["france", "paris"]
}

sitemaps = [
    "https://nahalgasht.com/tour-sitemap2.xml",
    "https://nahalgasht.com/tour-sitemap3.xml",
    "https://nahalgasht.com/tour-sitemap4.xml"
]

all_urls = []
for sm in sitemaps:
    try:
        req = urllib.request.Request(sm, headers={"User-Agent": "Mozilla/5.0"})
        content = urllib.request.urlopen(req, timeout=15).read().decode("utf-8")
        urls = re.findall(r"<loc>(https://nahalgasht\.com/tour/[^<]+)</loc>", content)
        all_urls.extend(urls)
    except Exception as e:
        print(f"Error fetching {sm}: {e}")

matches = defaultdict(list)
for u in set(all_urls):
    u_lower = u.lower()
    for dest, kw_list in dest_keywords.items():
        if any(kw in u_lower for kw in kw_list):
            if dest == "ترکیه" and "istanbul" in u_lower:
                continue
            matches[dest].append(u)

selected = []
for dest, urls in matches.items():
    urls_sorted = sorted(urls, key=lambda x: (len(x), x))
    step = max(1, len(urls_sorted) // 4)
    picked = [urls_sorted[i * step] for i in range(min(4, len(urls_sorted)))]
    for p in picked:
        if p not in [x[1] for x in selected]:
            selected.append((dest, p))

print(f"Total target URLs to parse: {len(selected)}")

req_headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}

def parse_single_tour(dest, url):
    try:
        req = urllib.request.Request(url, headers=req_headers)
        html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")
        
        # Decompose noise
        for tag in soup(["script", "style", "svg", "noscript", "header", "footer"]):
            tag.decompose()
            
        full_text = soup.get_text("\n")
        lines = [line.strip() for line in full_text.split("\n") if line.strip()]
        
        # H1 title
        h1_tag = soup.find("h1")
        title = h1_tag.get_text(strip=True) if h1_tag else (lines[0] if lines else "")
        
        # Breadcrumbs
        breadcrumbs = []
        bc_nav = soup.find(class_=re.compile(r"breadcrumb|breadcrumbs", re.I))
        if bc_nav:
            breadcrumbs = [a.get_text(strip=True) for a in bc_nav.find_all("a")]
        
        # Transport
        transport = "هواپیما"
        if any(x in url or x in full_text for x in ["قطار", "بن ریل", "فدک", "رجاء"]):
            transport = "قطار"
        elif any(x in url or x in full_text for x in ["زمینی", "اتوبوس", "vip", "VIP"]):
            transport = "زمینی / اتوبوس"
        
        # Origin detection
        origin = "تهران"
        origin_match = re.search(r"از\s+(مشهد|تبریز|شیراز|اصفهان|کرمان|رشت|گرگان|ارومیه|زنجان|یزد|کرمانشاه|اهواز|بندرعباس|ساری|قم)", title + " " + url)
        if origin_match:
            origin = origin_match.group(1)
            
        # Duration & Nights
        duration_text = ""
        nights_match = re.search(r"(\d+)\s*شب", full_text)
        days_match = re.search(r"(\d+)\s*روزه?", full_text)
        if nights_match:
            duration_text = f"{nights_match.group(1)} شب"
        elif days_match:
            duration_text = f"{days_match.group(1)} روز"
            
        # Pricing & Currency
        currencies = []
        if "تومان" in full_text: currencies.append("تومان")
        if "دلار" in full_text: currencies.append("دلار")
        if "یورو" in full_text: currencies.append("یورو")
        if "درهم" in full_text: currencies.append("درهم")
        
        price_starting = ""
        price_match = re.search(r"شروع قیمت از\s*\n*([\d,]+)\s*(تومان|دلار|یورو|درهم)", full_text)
        if price_match:
            price_starting = f"{price_match.group(1)} {price_match.group(2)}"
            
        flight_extra = ""
        flight_match = re.search(r"هزینه پرواز\s*\n*([\d,]+)\s*(تومان)?", full_text)
        if flight_match:
            flight_extra = f"{flight_match.group(1)} تومان"
        elif "هزینه پرواز محاسبه نشده" in full_text:
            flight_extra = "محاسبه نشده / جداگانه"
            
        # Hotel cards / options
        hotels = []
        hotel_blocks = soup.find_all(class_=re.compile(r"hotelcard|hotel-card|hotel_box", re.I))
        for hb in hotel_blocks[:8]:
            h_text = hb.get_text(" ", strip=True)
            stars_m = re.search(r"(\d)\s*ستاره", h_text)
            board_m = re.search(r"\b(BB|HB|FB|ALL|UALL|Bed & Breakfast)\b", h_text, re.I)
            hotels.append({
                "raw": h_text[:80],
                "stars": stars_m.group(1) if stars_m else None,
                "board": board_m.group(1) if board_m else None
            })
            
        # Itinerary
        itinerary_days = []
        day_matches = re.findall(r"روز\s+(اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم|یازدهم|دوازدهم|\d+)\s*[:\-—]?\s*([^\n]{10,120})", full_text)
        if day_matches:
            for dm in day_matches:
                itinerary_days.append(f"روز {dm[0]}: {dm[1].strip()}")
                
        # Services & Documents
        included_services = []
        docs_required = []
        
        # Locate "مدارک لازم" section
        if "مدارک لازم" in full_text:
            part = full_text.split("مدارک لازم")[1].split("خدمات تور")[0]
            docs_required = [l.strip() for l in part.split("\n") if len(l.strip()) > 3 and not any(k in l for k in ["نهال", "021", "026"])][:6]
            
        if "خدمات تور" in full_text:
            part = full_text.split("خدمات تور")[1].split("توضیحات")[0]
            included_services = [l.strip() for l in part.split("\n") if len(l.strip()) > 3 and not any(k in l for k in ["نهال", "021", "026"])][:8]

        return {
            "destination": dest,
            "url": url,
            "title": title,
            "origin": origin,
            "transport": transport,
            "duration": duration_text,
            "price_starting": price_starting,
            "flight_extra": flight_extra,
            "currencies": currencies,
            "hotel_count": len(hotels),
            "hotels_sample": hotels[:3],
            "itinerary_days": len(itinerary_days),
            "itinerary_sample": itinerary_days[:3],
            "docs_count": len(docs_required),
            "docs_sample": docs_required[:3],
            "services_count": len(included_services),
            "services_sample": included_services[:4],
        }
    except Exception as e:
        return {"destination": dest, "url": url, "error": str(e)}

results = []
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(parse_single_tour, d, u): (d, u) for d, u in selected}
    for future in as_completed(futures):
        res = future.result()
        results.append(res)
        print(f"[{len(results)}/{len(selected)}] Parsed: {res.get('destination')} - {res.get('title', '')[:40]}")

with open("nahalgasht_tours_analysis.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(results)} tour results to nahalgasht_tours_analysis.json successfully!")
